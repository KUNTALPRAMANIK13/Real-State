import {
  signOut,
  GoogleAuthProvider,
  signInWithPopup,
  signInWithRedirect,
  getRedirectResult,
  onAuthStateChanged,
  updateProfile,
  updateEmail,
  updatePassword,
  deleteUser,
} from "firebase/auth";
import { auth } from "../firebase";
import apiService from "./apiService";

class AuthService {
  // Traditional signup (email/password) - Backend only
  async traditionalSignUp(username, email, password) {
    try {
      const backendUser = await apiService.traditionalSignUp(
        username,
        email,
        password
      );
      return { backendUser };
    } catch (error) {
      throw this.handleAuthError(error);
    }
  }

  // Traditional signin (email/password) - Backend only
  async traditionalSignIn(email, password) {
    try {
      const backendUser = await apiService.traditionalSignIn(email, password);
      return { backendUser };
    } catch (error) {
      throw this.handleAuthError(error);
    }
  }

  // Google Sign In with Firebase
  async signInWithGoogle() {
    try {
      const provider = new GoogleAuthProvider();
      provider.setCustomParameters({
        prompt: "select_account",
      });

      // Add scopes to reduce COOP warnings
      provider.addScope("email");
      provider.addScope("profile");

      let result;
      try {
        result = await signInWithPopup(auth, provider);
      } catch (popupError) {
        // If popup is blocked or similar, fallback to redirect
        const popupIssues = [
          "auth/popup-blocked",
          "auth/cancelled-popup-request",
          "auth/popup-closed-by-user",
        ];

        if (popupIssues.includes(popupError.code)) {
          console.warn(
            "Popup sign-in failed; falling back to redirect:",
            popupError.message
          );
          await signInWithRedirect(auth, provider);
          return; // Redirect occurs
        }

        // For unauthorized domain, surface clearer error (redirect won't help)
        if (popupError.code === "auth/unauthorized-domain") {
          throw new Error(
            `This domain is not authorized for Firebase Auth. Add ${window.location.hostname} in Firebase Console → Authentication → Settings → Authorized domains.`
          );
        }

        throw popupError;
      }

      // Get Firebase ID token and authenticate with backend
      const idToken = await result.user.getIdToken();
      const backendUser = await apiService.authenticateWithFirebase(idToken);

      return {
        firebaseUser: result.user,
        backendUser: backendUser,
      };
    } catch (error) {
      throw this.handleAuthError(error);
    }
  }

  // Alternative Google Sign In using redirect (no COOP warnings)
  async signInWithGoogleRedirect() {
    try {
      const provider = new GoogleAuthProvider();
      provider.setCustomParameters({
        prompt: "select_account",
      });
      provider.addScope("email");
      provider.addScope("profile");

      await signInWithRedirect(auth, provider);
      // Note: This will redirect the page, so execution stops here
      // Use handleRedirectResult() after page loads to complete the process
    } catch (error) {
      throw this.handleAuthError(error);
    }
  }

  // Handle redirect result after Google OAuth redirect
  async handleRedirectResult() {
    try {
      const result = await getRedirectResult(auth);

      if (result) {
        // Get Firebase ID token and authenticate with backend
        const idToken = await result.user.getIdToken();
        const backendUser = await apiService.authenticateWithFirebase(idToken);

        return {
          firebaseUser: result.user,
          backendUser: backendUser,
        };
      }

      return null; // No redirect result
    } catch (error) {
      throw this.handleAuthError(error);
    }
  }

  // Sign out
  async signOut() {
    try {
      // Sign out from backend first
      await apiService.signOut();

      // Then sign out from Firebase
      await signOut(auth);
    } catch (error) {
      // Try to sign out from Firebase even if backend fails
      try {
        await signOut(auth);
      } catch (firebaseError) {
        console.error("Firebase sign out failed:", firebaseError);
      }
      throw this.handleAuthError(error);
    }
  }

  // Get current user's ID token
  async getCurrentUserToken() {
    if (auth.currentUser) {
      return await auth.currentUser.getIdToken();
    }
    return null;
  }

  // Refresh authentication with backend
  async refreshBackendAuth() {
    try {
      if (auth.currentUser) {
        const idToken = await auth.currentUser.getIdToken(true); // Force refresh
        return await apiService.authenticateWithFirebase(idToken);
      }
      return null;
    } catch (error) {
      console.error("Failed to refresh backend auth:", error);
      return null;
    }
  }

  // Update user profile
  async updateUserProfile(updates) {
    try {
      if (auth.currentUser) {
        await updateProfile(auth.currentUser, updates);
        return auth.currentUser;
      }
      throw new Error("No user is currently signed in");
    } catch (error) {
      throw this.handleAuthError(error);
    }
  }

  // Update email
  async updateUserEmail(newEmail) {
    try {
      if (auth.currentUser) {
        await updateEmail(auth.currentUser, newEmail);
        return auth.currentUser;
      }
      throw new Error("No user is currently signed in");
    } catch (error) {
      throw this.handleAuthError(error);
    }
  }

  // Update password
  async updateUserPassword(newPassword) {
    try {
      if (auth.currentUser) {
        await updatePassword(auth.currentUser, newPassword);
        return auth.currentUser;
      }
      throw new Error("No user is currently signed in");
    } catch (error) {
      throw this.handleAuthError(error);
    }
  }

  // Delete user
  async deleteUserAccount() {
    try {
      if (auth.currentUser) {
        await deleteUser(auth.currentUser);
      }
      throw new Error("No user is currently signed in");
    } catch (error) {
      throw this.handleAuthError(error);
    }
  }

  // Get current user
  getCurrentUser() {
    return auth.currentUser;
  }

  // Listen to auth state changes
  onAuthStateChange(callback) {
    return onAuthStateChanged(auth, callback);
  }

  // Get user token
  async getUserToken() {
    try {
      if (auth.currentUser) {
        return await auth.currentUser.getIdToken();
      }
      return null;
    } catch (error) {
      throw this.handleAuthError(error);
    }
  }

  // Handle Firebase Auth errors
  handleAuthError(error) {
    let message = "An error occurred during authentication";

    switch (error.code) {
      case "auth/user-not-found":
        message = "No user found with this email address";
        break;
      case "auth/wrong-password":
        message = "Incorrect password";
        break;
      case "auth/email-already-in-use":
        message = "An account with this email already exists";
        break;
      case "auth/weak-password":
        message = "Password should be at least 6 characters";
        break;
      case "auth/invalid-email":
        message = "Invalid email address";
        break;
      case "auth/too-many-requests":
        message = "Too many unsuccessful attempts. Please try again later";
        break;
      case "auth/network-request-failed":
        message = "Network error. Please check your connection";
        break;
      case "auth/popup-closed-by-user":
        message = "Sign-in popup was closed";
        break;
      case "auth/cancelled-popup-request":
        message = "Sign-in was cancelled";
        break;
      case "auth/popup-blocked":
        message =
          "Popup was blocked by the browser; retry or we’ll use redirect.";
        break;
      case "auth/unauthorized-domain":
        message = `This domain is not authorized for Firebase Auth. Add ${window.location.hostname} in Firebase Console → Authentication → Settings → Authorized domains.`;
        break;
      default:
        message = error.message || message;
    }

    return new Error(message);
  }
}

export default new AuthService();
