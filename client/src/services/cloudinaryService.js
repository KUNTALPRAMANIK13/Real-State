class CloudinaryService {
  constructor() {
    this.cloudName = import.meta.env.VITE_CLOUDINARY_CLOUD_NAME;
    this.uploadPreset = import.meta.env.VITE_CLOUDINARY_UPLOAD_PRESET;
    this.apiKey = import.meta.env.VITE_CLOUDINARY_API_KEY;

    if (!this.cloudName || !this.uploadPreset) {
      console.error(
        "Cloudinary configuration missing. Please check your environment variables."
      );
    }
  }

  // Upload single image
  async uploadImage(file, folder = "images", userId = null) {
    try {
      // Validate file
      if (!this.isValidImageFile(file)) {
        throw new Error("Invalid file type. Please upload an image file.");
      }

      if (file.size > 10 * 1024 * 1024) {
        // 10MB limit
        throw new Error(
          "File size too large. Please upload an image smaller than 10MB."
        );
      }

      const formData = new FormData();
      formData.append("file", file);
      formData.append("upload_preset", this.uploadPreset);

      // Create folder structure
      const folderPath = userId ? `${folder}/${userId}` : folder;
      formData.append("folder", folderPath);

      // Add timestamp to filename to ensure uniqueness
      const timestamp = new Date().getTime();
      const fileName = `${timestamp}_${file.name.split(".")[0]}`;
      formData.append("public_id", fileName);

      const response = await fetch(
        `https://api.cloudinary.com/v1_1/${this.cloudName}/image/upload`,
        {
          method: "POST",
          body: formData,
        }
      );

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error?.message || "Upload failed");
      }

      const data = await response.json();

      return {
        url: data.secure_url,
        publicId: data.public_id,
        path: data.public_id, // Keep for compatibility with existing code
        name: fileName,
        originalName: file.name,
        size: data.bytes,
        format: data.format,
        resourceType: data.resource_type,
      };
    } catch (error) {
      console.error("Cloudinary upload error:", error);
      throw error;
    }
  }

  // Upload multiple images
  async uploadMultipleImages(files, folder = "listings", userId = null) {
    try {
      const uploadPromises = Array.from(files).map((file) =>
        this.uploadImage(file, folder, userId)
      );

      const results = await Promise.all(uploadPromises);
      return results;
    } catch (error) {
      console.error("Multiple upload error:", error);
      throw error;
    }
  }

  // Delete image by public ID
  async deleteImage(publicId) {
    try {
      // For deletion, we need to use the backend API since we can't delete from frontend directly
      // This is a security feature of Cloudinary
      const response = await fetch("/api/cloudinary/delete", {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ publicId }),
      });

      if (!response.ok) {
        throw new Error("Failed to delete image");
      }

      console.log("Image deleted successfully");
      return await response.json();
    } catch (error) {
      console.error("Error deleting image:", error);
      throw error;
    }
  }

  // Get user images (this would typically be done through your backend API)
  async getUserImages(userId, folder = "images") {
    try {
      // In a real application, you'd typically fetch this from your backend
      // which would query Cloudinary's admin API
      const response = await fetch(
        `/api/cloudinary/user-images/${userId}?folder=${folder}`
      );

      if (!response.ok) {
        throw new Error("Failed to fetch user images");
      }

      return await response.json();
    } catch (error) {
      console.error("Error fetching user images:", error);
      throw error;
    }
  }

  // Validate image file types
  isValidImageFile(file) {
    const validTypes = [
      "image/jpeg",
      "image/jpg",
      "image/png",
      "image/gif",
      "image/webp",
      "image/bmp",
      "image/tiff",
      "image/tif",
      "image/svg+xml",
      "image/x-icon",
      "image/ico",
      "image/heic",
      "image/heif",
      "image/avif",
      "image/jxl",
    ];

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

  // Get optimized image URL with transformations
  getOptimizedImageUrl(publicId, options = {}) {
    const {
      width = 800,
      height = 600,
      crop = "fill",
      quality = "auto",
      format = "auto",
    } = options;

    return `https://res.cloudinary.com/${this.cloudName}/image/upload/w_${width},h_${height},c_${crop},q_${quality},f_${format}/${publicId}`;
  }

  // Get thumbnail URL
  getThumbnailUrl(publicId, size = 150) {
    return `https://res.cloudinary.com/${this.cloudName}/image/upload/w_${size},h_${size},c_fill,q_auto,f_auto/${publicId}`;
  }

  // Compress image before upload (client-side compression)
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

export default new CloudinaryService();
