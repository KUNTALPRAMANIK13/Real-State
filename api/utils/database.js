import mongoose from "mongoose";

// Simple connection for Vercel serverless
export const connectDB = async () => {
  try {
    // If already connected, return
    if (mongoose.connection.readyState === 1) {
      return mongoose.connection;
    }

    // Simple connection with minimal options
    await mongoose.connect(process.env.MONGO, {
      bufferCommands: false,
    });

    console.log("MongoDB connected");
    return mongoose.connection;
  } catch (error) {
    console.error("MongoDB connection error:", error);
    throw error;
  }
};
