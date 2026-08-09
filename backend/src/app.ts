import express from "express";
import cors from "cors";
import helmet from "helmet";
import morgan from "morgan";
import { config } from "./config";
import authRoutes from "./routes/authRoutes";
import userRoutes from "./routes/userRoutes";
import recordRoutes from "./routes/recordRoutes";
import { getHealth } from "./controllers/recordController";
import { errorHandler } from "./middleware/errorHandler";

const app = express();

// Security & Logging Middleware
app.use(helmet());
app.use(
  cors({
    origin: [config.corsOrigin, "http://localhost:3000", "http://localhost:3001"],
    credentials: true,
  })
);
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(morgan("dev"));

// Health Check Endpoint
app.get("/health", getHealth);
app.get("/api/v1/health", getHealth);

// API v1 Routes
app.use("/api/v1/auth", authRoutes);
app.use("/api/v1/users", userRoutes);
app.use("/api/v1/records", recordRoutes);

// Global Error Handler
app.use(errorHandler);

export default app;
