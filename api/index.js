import express from "express";
import mongoose from "mongoose";
import dotenv from "dotenv";
import userRouter from "./routes/user.route.js";
import authRouter from "./routes/auth.route.js";
import listingRouter from "./routes/listing.route.js";
import cookieParser from "cookie-parser";
// import path from 'path';
import cors from "cors";
import { connectDB, disconnectDB } from "./utils/database.js";

dotenv.config();

const app = express();
const corsOptions = {
  origin: [
    "http://localhost:5173",
    "http://localhost:3000",
    "http://localhost:5174", // Additional Vite port
    "https://real-state-ptnc.vercel.app",
    process.env.ALLOWED_ORIGIN || "https://real-state-ptnc.vercel.app",
  ],
  credentials: true,
  methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
  allowedHeaders: ["Content-Type", "Authorization", "X-Requested-With"],
  optionsSuccessStatus: 200,
  preflightContinue: false,
};

app.use(cors(corsOptions));

// Handle preflight requests
app.options("*", cors(corsOptions));
app.use(express.json());
app.use(cookieParser());

// Middleware to ensure fresh DB connection for each request
app.use(async (req, res, next) => {
  try {
    await connectDB();
    next();
  } catch (error) {
    console.error("Database connection failed:", error);
    res.status(500).json({
      success: false,
      message: "Database connection failed",
      error: error.message,
    });
  }
});

// Middleware to disconnect DB after each response
app.use((req, res, next) => {
  const originalSend = res.send;
  const originalJson = res.json;

  // Override res.send to disconnect after response
  res.send = function (...args) {
    disconnectDB().catch((err) => console.error("Disconnect error:", err));
    return originalSend.apply(this, args);
  };

  // Override res.json to disconnect after response
  res.json = function (...args) {
    disconnectDB().catch((err) => console.error("Disconnect error:", err));
    return originalJson.apply(this, args);
  };

  next();
});


app.use("/api/user", userRouter);
app.use("/api/auth", authRouter);
app.use("/api/listing", listingRouter);

// const __dirname = path.resolve();
// app.use(express.static(path.join(__dirname, '/client/dist')));

// app.get('*', (req, res) => {
//   res.sendFile(path.join(__dirname, 'client', 'dist', 'index.html'));
// })

app.use((err, req, res, next) => {
  // Ensure disconnection even on errors
  disconnectDB().catch((disconnectErr) =>
    console.error("Error disconnecting on error:", disconnectErr)
  );

  const statusCode = err.statusCode || 500;
  const message = err.message || "Internal Server Error";
  return res.status(statusCode).json({
    success: false,
    statusCode,
    message,
  });
});

// For local development
if (process.env.NODE_ENV !== "production") {
  app.listen(3000, () => {
    console.log("Server is running on port 3000");
  });
}

// Export for Vercel
export default app;
