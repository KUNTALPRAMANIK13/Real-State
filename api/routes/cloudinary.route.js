import express from "express";
import {
  deleteImage,
  getUserImages,
  getImageDetails,
  cleanupImages,
} from "../controllers/cloudinary.controller.js";
import { verifyUser } from "../utils/verifyUser.js";

const router = express.Router();

// Delete image - requires authentication
router.delete("/delete", verifyUser, deleteImage);

// Get user images - requires authentication
router.get("/user-images/:userId", verifyUser, getUserImages);

// Get image details - requires authentication
router.get("/image/:publicId", verifyUser, getImageDetails);

// Cleanup images - admin only (you might want to add admin verification)
router.post("/cleanup", verifyUser, cleanupImages);

export default router;
