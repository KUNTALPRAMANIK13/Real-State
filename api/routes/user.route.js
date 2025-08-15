import express from "express";
import {
  deleteUser,
  updateUser,
  getUserListings,
} from "../controllers/user.controller.js";
import { verifyToken } from "../utils/verifyUser.js";

const router = express.Router();

// Health check endpoint for user routes
router.get("/health", (req, res) => {
  res.status(200).json({
    success: true,
    message: "User routes working!",
    timestamp: new Date().toISOString(),
  });
});

router.post("/update/:id", verifyToken, updateUser);
router.delete("/delete/:id", verifyToken, deleteUser);
router.get("/listings/:id", verifyToken, getUserListings);

export default router;
