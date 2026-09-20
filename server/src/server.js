import "dotenv/config";
import express from "express";
import cors from "cors";
import helmet from "helmet";
import rateLimit from "express-rate-limit";

import { connectDB } from "./config/db.js";
import auth from "./routes/auth.js";
import agencies from "./routes/agencies.js";
import bookings from "./routes/bookings.js";
import schedules from "./routes/schedules.js";
import payments from "./routes/payments.js";
import users from "./routes/users.js";
import notifications from "./routes/notifications.js";
import audit from "./routes/audit.js";

const app = express();

const PORT = process.env.PORT || 5001;
const CLIENT_URL = process.env.CLIENT_URL || "http://localhost:5173";
const apiLimiter = rateLimit({ windowMs: 15 * 60 * 1000, max: 300, standardHeaders: true, legacyHeaders: false });
const authLimiter = rateLimit({ windowMs: 15 * 60 * 1000, max: 30, standardHeaders: true, legacyHeaders: false, message: { message: "Too many authentication attempts. Please try again later." } });

// Middleware
app.use(helmet());
app.use(
  cors({
    origin: CLIENT_URL,
    credentials: true,
  })
);

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use('/api', apiLimiter);

// Health check
app.get("/api/health", (req, res) => {
  res.json({
    ok: true,
    service: "SmithGo Express",
    message: "API is running successfully",
  });
});

// API routes
app.use("/api/auth", authLimiter, auth);
app.use("/api/agencies", agencies);
app.use("/api/bookings", bookings);
app.use("/api/schedules", schedules);
app.use("/api/payments", payments);
app.use("/api/users", users);
app.use("/api/notifications", notifications);
app.use("/api/audit", audit);

// 404 handler
app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: `Route not found: ${req.method} ${req.originalUrl}`,
  });
});

// Global error handler
app.use((err, req, res, next) => {
  console.error("SERVER ERROR:", err);

  res.status(err.status || 500).json({
    success: false,
    message: err.message || "Internal server error",
  });
});

// Start server
const startServer = async () => {
  try {
    await connectDB();

    app.listen(PORT, () => {
      console.log(`API running on ${PORT}`);
      console.log(`Client URL: ${CLIENT_URL}`);
      console.log(`Health: http://localhost:${PORT}/api/health`);
    });
  } catch (error) {
    console.error("Failed to start server:", error);
    process.exit(1);
  }
};

startServer();