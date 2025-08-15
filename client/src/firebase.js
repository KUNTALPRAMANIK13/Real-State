// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
import { getAuth } from "firebase/auth";
import { getStorage } from "firebase/storage";
// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyB1YZzip-IuXJwUM53ea9Gc-26MpRb8sEQ",
  authDomain: "realstate13-fbfaa.firebaseapp.com",
  projectId: "realstate13-fbfaa",
  storageBucket: "realstate13-fbfaa.firebasestorage.app",
  messagingSenderId: "1042614896468",
  appId: "1:1042614896468:web:016122b93e16be45002ac1",
  measurementId: "G-D1F7Q11QGX"
};

// Initialize Firebase
export const app = initializeApp(firebaseConfig);
const analytics = getAnalytics(app);

// Initialize Firebase Authentication and get a reference to the service
export const auth = getAuth(app);

// Initialize Cloud Storage and get a reference to the service
export const storage = getStorage(app);

export default app;
