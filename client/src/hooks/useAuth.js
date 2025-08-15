import { useEffect } from "react";
import { useDispatch } from "react-redux";
import { onAuthStateChanged } from "firebase/auth";
import { auth } from "../firebase";
import { signInSuccess, signOutUserSuccess } from "../redux/user/userSlice";

export const useAuth = () => {
  const dispatch = useDispatch();

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (user) {
        // User is signed in with Firebase
        console.log("Firebase user signed in:", user);
        // You can dispatch user data to Redux if needed
        // But for your app, you're handling auth through your backend
      } else {
        // User is signed out
        console.log("Firebase user signed out");
        // You might want to clear Redux state here if needed
      }
    });

    // Cleanup subscription on unmount
    return () => unsubscribe();
  }, [dispatch]);

  return auth.currentUser;
};
