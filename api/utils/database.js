import mongoose from "mongoose";

let isConnected = false;

export const connectDB = async () => {
  if (isConnected) {
    console.log("Using existing database connection");
    return;
  }

  try {
    // Set mongoose options for serverless
    mongoose.set("strictQuery", false);

    const db = await mongoose.connect(process.env.MONGO, {
      bufferCommands: false,
      maxPoolSize: 1, // Maintain up to 1 socket connections
      serverSelectionTimeoutMS: 5000, // Keep trying to send operations for 5 seconds
      socketTimeoutMS: 45000, // Close sockets after 45 seconds of inactivity
      family: 4, // Use IPv4, skip trying IPv6
    });

    isConnected = db.connections[0].readyState === 1;
    console.log("MongoDB connected successfully");

    return db;
  } catch (error) {
    console.error("MongoDB connection error:", error);
    isConnected = false;
    throw error;
  }
};

export const disconnectDB = async () => {
  if (isConnected) {
    await mongoose.disconnect();
    isConnected = false;
    console.log("MongoDB disconnected");
  }
};

// Handle connection events
mongoose.connection.on("connected", () => {
  console.log("Mongoose connected to MongoDB");
  isConnected = true;
});

mongoose.connection.on("error", (err) => {
  console.error("Mongoose connection error:", err);
  isConnected = false;
});

mongoose.connection.on("disconnected", () => {
  console.log("Mongoose disconnected");
  isConnected = false;
});

// Handle process termination
process.on("SIGINT", async () => {
  await disconnectDB();
  process.exit(0);
});
