import mongoose from "mongoose";

// For serverless - always connect fresh for each request
export const connectDB = async () => {
  try {
    // Disconnect any existing connections first
    if (mongoose.connections[0].readyState !== 0) {
      await mongoose.disconnect();
      console.log("Disconnected previous MongoDB connection");
    }

    // Set mongoose options for serverless
    mongoose.set("strictQuery", false);

    const db = await mongoose.connect(process.env.MONGO, {
      bufferCommands: false,
      maxPoolSize: 1, // Single connection for serverless
      serverSelectionTimeoutMS: 5000, // Quick timeout for serverless
      socketTimeoutMS: 10000, // Shorter timeout for serverless
      connectTimeoutMS: 5000, // Connection timeout
      family: 4, // Use IPv4
      maxIdleTimeMS: 1000, // Close connection quickly when idle
    });

    console.log("MongoDB connected fresh for this request");
    return db;
  } catch (error) {
    console.error("MongoDB connection error:", error);
    throw error;
  }
};

// Disconnect after each request
export const disconnectDB = async () => {
  try {
    if (mongoose.connections[0].readyState !== 0) {
      await mongoose.disconnect();
      console.log("MongoDB disconnected after request");
    }
  } catch (error) {
    console.error("Error disconnecting MongoDB:", error);
  }
};

// Force disconnect on any connection errors
mongoose.connection.on("error", async (err) => {
  console.error("Mongoose connection error:", err);
  try {
    await mongoose.disconnect();
  } catch (disconnectError) {
    console.error("Error during force disconnect:", disconnectError);
  }
});

mongoose.connection.on("disconnected", () => {
  console.log("Mongoose disconnected - ready for new connection");
});
