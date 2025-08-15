import { v2 as cloudinary } from "cloudinary";
import { errorHandler } from "../utils/error.js";

// Configure Cloudinary
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

// Delete image from Cloudinary
export const deleteImage = async (req, res, next) => {
  try {
    const { publicId } = req.body;

    if (!publicId) {
      return next(errorHandler(400, "Public ID is required"));
    }

    // Delete the image from Cloudinary
    const result = await cloudinary.uploader.destroy(publicId);

    if (result.result === "ok") {
      res.status(200).json({
        success: true,
        message: "Image deleted successfully",
        result: result,
      });
    } else {
      return next(errorHandler(400, "Failed to delete image"));
    }
  } catch (error) {
    console.error("Cloudinary delete error:", error);
    next(errorHandler(500, "Error deleting image from Cloudinary"));
  }
};

// Get user images (for admin purposes or user galleries)
export const getUserImages = async (req, res, next) => {
  try {
    const { userId } = req.params;
    const { folder = "images" } = req.query;

    if (!userId) {
      return next(errorHandler(400, "User ID is required"));
    }

    // Search for images in the user's folder
    const folderPath = `${folder}/${userId}`;

    const result = await cloudinary.search
      .expression(`folder:${folderPath}/*`)
      .sort_by([["created_at", "desc"]])
      .max_results(30)
      .execute();

    const images = result.resources.map((resource) => ({
      publicId: resource.public_id,
      url: resource.secure_url,
      name: resource.filename || resource.public_id.split("/").pop(),
      path: resource.public_id,
      size: resource.bytes,
      format: resource.format,
      createdAt: resource.created_at,
    }));

    res.status(200).json({
      success: true,
      images: images,
      total: result.total_count,
    });
  } catch (error) {
    console.error("Cloudinary search error:", error);
    next(errorHandler(500, "Error fetching user images"));
  }
};

// Get image details
export const getImageDetails = async (req, res, next) => {
  try {
    const { publicId } = req.params;

    if (!publicId) {
      return next(errorHandler(400, "Public ID is required"));
    }

    const result = await cloudinary.api.resource(publicId);

    res.status(200).json({
      success: true,
      image: {
        publicId: result.public_id,
        url: result.secure_url,
        format: result.format,
        size: result.bytes,
        width: result.width,
        height: result.height,
        createdAt: result.created_at,
      },
    });
  } catch (error) {
    console.error("Cloudinary details error:", error);
    next(errorHandler(500, "Error fetching image details"));
  }
};

// Cleanup old/unused images (for maintenance)
export const cleanupImages = async (req, res, next) => {
  try {
    // This would be used to clean up images that are no longer referenced
    // You could implement logic to compare images in Cloudinary with your database

    res.status(200).json({
      success: true,
      message: "Cleanup functionality not yet implemented",
    });
  } catch (error) {
    console.error("Cloudinary cleanup error:", error);
    next(errorHandler(500, "Error during cleanup"));
  }
};
