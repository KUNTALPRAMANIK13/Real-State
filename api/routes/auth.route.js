import express from "express";
import {
  signup,
  signin,
  google,
  signOut,
  firebaseAuth,
} from "../controllers/auth.controller.js";
import { verifyFirebaseToken } from "../utils/verifyFirebaseToken.js";

const router = express.Router();

// Health check endpoint
router.get("/health", (req, res) => {
  res.status(200).json({
    success: true,
    message: "Backend is working!",
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV || "development",
  });
});

router.post("/signup", signup);
router.post("/signin", signin);
router.post("/google", google);
router.post("/firebase", verifyFirebaseToken, firebaseAuth);
router.get("/signout", signOut);

export default router;
