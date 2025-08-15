import React, { createContext, useEffect } from "react";
import { useDispatch } from "react-redux";
import { signInSuccess, signInFailure } from "../redux/user/userSlice";
import authService from "../services/authService";
import PropTypes from "prop-types";

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const dispatch = useDispatch();

  useEffect(() => {
    const unsubscribe = authService.onAuthStateChange(async (firebaseUser) => {
      if (firebaseUser) {
        try {
          // User is signed in with Firebase, sync with backend
          const backendUser = await authService.refreshBackendAuth();

          if (backendUser) {
            const userData = {
              _id: backendUser._id,
              username: backendUser.username,
              email: backendUser.email,
              avatar: backendUser.avatar,
              emailVerified: backendUser.emailVerified,
              firebaseUid: backendUser.firebaseUid,
              firebaseUser: {
                uid: firebaseUser.uid,
                email: firebaseUser.email,
                displayName: firebaseUser.displayName,
                photoURL: firebaseUser.photoURL,
              },
            };

            dispatch(signInSuccess(userData));
            // console.log("User authenticated:", userData);
          } else {
            console.log("Failed to sync with backend, signing out");
            await authService.signOut();
          }
        } catch (error) {
          console.error("Error syncing user with backend:", error);
          dispatch(signInFailure(error.message));
        }
      } else {
        // User is signed out
        dispatch(signInFailure(null));
        console.log("User signed out");
      }
    });

    // Cleanup subscription on unmount
    return () => unsubscribe();
  }, [dispatch]);

  return <AuthContext.Provider value={{}}>{children}</AuthContext.Provider>;
};

AuthProvider.propTypes = {
  children: PropTypes.node.isRequired,
};
