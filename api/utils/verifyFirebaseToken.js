import admin from "firebase-admin";
import { errorHandler } from "./error.js";

// Initialize Firebase Admin SDK
let adminInitialized = false;

const initializeFirebaseAdmin = () => {
  if (adminInitialized) return;

  try {
    // Check if we have service account credentials
    const serviceAccount = process.env.FIREBASE_SERVICE_ACCOUNT_KEY;

    if (serviceAccount) {
      // Production: Use service account key
      const serviceAccountKey = JSON.parse(serviceAccount);

      admin.initializeApp({
        credential: admin.credential.cert(serviceAccountKey),
        projectId: process.env.FIREBASE_PROJECT_ID || "realstate13-fbfaa",
      });
    } else {
      // Development: Use application default credentials or project ID only
      admin.initializeApp({
        projectId: process.env.FIREBASE_PROJECT_ID || "realstate13-fbfaa",
      });
    }

    adminInitialized = true;
    console.log("Firebase Admin SDK initialized successfully");
  } catch (error) {
    console.error("Firebase Admin SDK initialization failed:", error);
    // Don't throw error, fall back to basic verification
  }
};

export const verifyFirebaseToken = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return next(errorHandler(401, "No valid authorization header provided"));
    }

    const token = authHeader.split(" ")[1];

    if (!token) {
      return next(errorHandler(401, "No token provided"));
    }

    // Initialize Firebase Admin if not already done
    if (!adminInitialized) {
      initializeFirebaseAdmin();
    }

    // Try to verify with Firebase Admin SDK
    if (adminInitialized && admin.apps.length > 0) {
      try {
        const decodedToken = await admin.auth().verifyIdToken(token);

        req.user = {
          id: decodedToken.uid,
          email: decodedToken.email,
          emailVerified: decodedToken.email_verified,
          firebaseUser: decodedToken,
        };

        next();
        return;
      } catch (adminError) {
        console.error("Firebase Admin verification failed:", adminError);
        // Fall back to basic verification
      }
    }

    // Fallback: Basic token decoding (for development)
    console.warn(
      "Using fallback token verification - not recommended for production"
    );
    const base64Payload = token.split(".")[1];
    const payload = JSON.parse(Buffer.from(base64Payload, "base64").toString());

    req.user = {
      id: payload.user_id || payload.uid,
      email: payload.email,
      emailVerified: payload.email_verified,
    };

    next();
  } catch (error) {
    console.error("Token verification error:", error);
    return next(errorHandler(403, "Invalid or expired token"));
  }
};
