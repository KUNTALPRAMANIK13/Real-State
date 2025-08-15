import {
  ref,
  uploadBytesResumable,
  getDownloadURL,
  deleteObject,
  listAll,
} from "firebase/storage";
import { storage } from "../firebase";

class StorageService {
  // Upload image with progress tracking
  async uploadImage(file, folder = "images", userId = null) {
    try {
      // Validate file
      if (!this.isValidImageFile(file)) {
        throw new Error("Invalid file type. Please upload an image file.");
      }

      if (file.size > 10 * 1024 * 1024) {
        // 10MB limit (increased from 5MB)
        throw new Error(
          "File size too large. Please upload an image smaller than 10MB."
        );
      }

      // Create unique filename
      const timestamp = new Date().getTime();
      const fileName = `${timestamp}_${file.name}`;
      const path = userId
        ? `${folder}/${userId}/${fileName}`
        : `${folder}/${fileName}`;

      const storageRef = ref(storage, path);
      const uploadTask = uploadBytesResumable(storageRef, file);

      return new Promise((resolve, reject) => {
        uploadTask.on(
          "state_changed",
          (snapshot) => {
            const progress =
              (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
            console.log(`Upload is ${progress}% done`);
          },
          (error) => {
            console.error("Upload error:", error);
            reject(error);
          },
          async () => {
            try {
              const downloadURL = await getDownloadURL(uploadTask.snapshot.ref);
              resolve({
                url: downloadURL,
                path: path,
                name: fileName,
              });
            } catch (error) {
              reject(error);
            }
          }
        );
      });
    } catch (error) {
      throw error;
    }
  }

  // Upload multiple images (for property listings)
  async uploadMultipleImages(files, folder = "listings", userId = null) {
    try {
      const uploadPromises = Array.from(files).map((file) =>
        this.uploadImage(file, folder, userId)
      );

      const results = await Promise.all(uploadPromises);
      return results;
    } catch (error) {
      throw error;
    }
  }

  // Delete image
  async deleteImage(imagePath) {
    try {
      const imageRef = ref(storage, imagePath);
      await deleteObject(imageRef);
      console.log("Image deleted successfully");
    } catch (error) {
      console.error("Error deleting image:", error);
      throw error;
    }
  }

  // Get all images for a user
  async getUserImages(userId, folder = "images") {
    try {
      const folderRef = ref(storage, `${folder}/${userId}`);
      const result = await listAll(folderRef);

      const imagePromises = result.items.map(async (itemRef) => {
        const url = await getDownloadURL(itemRef);
        return {
          name: itemRef.name,
          path: itemRef.fullPath,
          url: url,
        };
      });

      return await Promise.all(imagePromises);
    } catch (error) {
      console.error("Error fetching user images:", error);
      throw error;
    }
  }

  // Validate image file - Allow all common image formats
  isValidImageFile(file) {
    const validTypes = [
      // Standard web formats
      "image/jpeg",
      "image/jpg",
      "image/png",
      "image/gif",
      "image/webp",
      // Additional formats
      "image/bmp",
      "image/tiff",
      "image/tif",
      "image/svg+xml",
      "image/x-icon",
      "image/ico",
      "image/heic",
      "image/heif",
      // RAW formats (though may not display in browser)
      "image/avif",
      "image/jxl",
    ];

    // Also check file extension as fallback
    const fileExtension = file.name.toLowerCase().split(".").pop();
    const validExtensions = [
      "jpg",
      "jpeg",
      "png",
      "gif",
      "webp",
      "bmp",
      "tiff",
      "tif",
      "svg",
      "ico",
      "heic",
      "heif",
      "avif",
      "jxl",
    ];

    return (
      validTypes.includes(file.type) || validExtensions.includes(fileExtension)
    );
  }

  // Compress image before upload (optional)
  async compressImage(file, maxWidth = 1920, quality = 0.8) {
    return new Promise((resolve) => {
      const canvas = document.createElement("canvas");
      const ctx = canvas.getContext("2d");
      const img = new Image();

      img.onload = () => {
        // Calculate new dimensions
        const ratio = Math.min(maxWidth / img.width, maxWidth / img.height);
        canvas.width = img.width * ratio;
        canvas.height = img.height * ratio;

        // Draw and compress
        ctx.drawImage(img, 0, 0, canvas.width, canvas.height);

        canvas.toBlob(resolve, file.type, quality);
      };

      img.src = URL.createObjectURL(file);
    });
  }
}

export default new StorageService();
