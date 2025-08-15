import express from "express";
import {
  deleteImage,
  getUserImages,
  getImageDetails,
  cleanupImages,
} from "../controllers/cloudinary.controller.js";
import { verifyToken } from "../utils/verifyUser.js";

const router = express.Router();

// Delete image - requires authentication
router.delete("/delete", verifyToken, deleteImage);

// Get user images - requires authentication
router.get("/user-images/:userId", verifyToken, getUserImages);

// Get image details - requires authentication  
router.get("/image/:publicId", verifyToken, getImageDetails);

// Cleanup images - admin only (you might want to add admin verification)
router.post("/cleanup", verifyToken, cleanupImages);export default router;
