import React, { useState } from "react";
import cloudinaryService from "../services/cloudinaryService";

const ImageUpload = ({
  multiple = false,
  maxFiles = 6,
  onUploadComplete,
  onUploadError,
  userId,
  folder = "listings",
}) => {
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState({});
  const [uploadedImages, setUploadedImages] = useState([]);

  const handleFileSelect = async (e) => {
    const files = Array.from(e.target.files);

    if (!multiple && files.length > 1) {
      onUploadError?.("Please select only one file");
      return;
    }

    if (multiple && files.length > maxFiles) {
      onUploadError?.(`Please select no more than ${maxFiles} files`);
      return;
    }

    setUploading(true);
    setUploadProgress({});

    try {
      if (multiple) {
        // Upload multiple files
        const results = await cloudinaryService.uploadMultipleImages(
          files,
          folder,
          userId
        );
        setUploadedImages(results);
        onUploadComplete?.(results);
      } else {
        // Upload single file
        const result = await cloudinaryService.uploadImage(
          files[0],
          folder,
          userId
        );
        setUploadedImages([result]);
        onUploadComplete?.(result);
      }
    } catch (error) {
      console.error("Upload error:", error);
      onUploadError?.(error.message);
    } finally {
      setUploading(false);
    }
  };

  const removeImage = async (index) => {
    try {
      const imageToRemove = uploadedImages[index];
      await cloudinaryService.deleteImage(
        imageToRemove.publicId || imageToRemove.path
      );

      const newImages = uploadedImages.filter((_, i) => i !== index);
      setUploadedImages(newImages);
      onUploadComplete?.(multiple ? newImages : null);
    } catch (error) {
      console.error("Error removing image:", error);
      onUploadError?.("Failed to remove image");
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-center w-full">
        <label className="flex flex-col items-center justify-center w-full h-64 border-2 border-gray-300 border-dashed rounded-lg cursor-pointer bg-gray-50 hover:bg-gray-100">
          <div className="flex flex-col items-center justify-center pt-5 pb-6">
            <svg
              className="w-8 h-8 mb-4 text-gray-500"
              aria-hidden="true"
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 20 16"
            >
              <path
                stroke="currentColor"
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="M13 13h3a3 3 0 0 0 0-6h-.025A5.56 5.56 0 0 0 16 6.5 5.5 5.5 0 0 0 5.207 5.021C5.137 5.017 5.071 5 5 5a4 4 0 0 0 0 8h2.167M10 15V6m0 0L8 8m2-2 2 2"
              />
            </svg>
            <p className="mb-2 text-sm text-gray-500">
              <span className="font-semibold">Click to upload</span> or drag and
              drop
            </p>
            <p className="text-xs text-gray-500">
              PNG, JPG, GIF up to 5MB {multiple && `(max ${maxFiles} files)`}
            </p>
          </div>
          <input
            type="file"
            className="hidden"
            multiple={multiple}
            accept="image/*"
            onChange={handleFileSelect}
            disabled={uploading}
          />
        </label>
      </div>

      {uploading && (
        <div className="text-center">
          <div className="inline-flex items-center px-4 py-2 font-semibold leading-6 text-sm shadow rounded-md text-white bg-indigo-500">
            <svg
              className="animate-spin -ml-1 mr-3 h-5 w-5 text-white"
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
            >
              <circle
                className="opacity-25"
                cx="12"
                cy="12"
                r="10"
                stroke="currentColor"
                strokeWidth="4"
              ></circle>
              <path
                className="opacity-75"
                fill="currentColor"
                d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
              ></path>
            </svg>
            Uploading...
          </div>
        </div>
      )}

      {uploadedImages.length > 0 && (
        <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
          {uploadedImages.map((image, index) => (
            <div key={index} className="relative group">
              <img
                src={image.url}
                alt={`Uploaded ${index + 1}`}
                className="w-full h-32 object-cover rounded-lg"
              />
              <button
                onClick={() => removeImage(index)}
                className="absolute top-2 right-2 bg-red-600 text-white rounded-full w-6 h-6 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
              >
                ×
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default ImageUpload;
