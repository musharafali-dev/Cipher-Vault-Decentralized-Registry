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
import { rateLimiter } from "./middleware/rateLimiter";
import { payloadSanitizer } from "./middleware/sanitizer";

const app = express();

// Enhanced Security Headers via Helmet
app.use(
  helmet({
    contentSecurityPolicy: {
      directives: {
        defaultSrc: ["'self'"],
        scriptSrc: ["'self'"],
        styleSrc: ["'self'", "'unsafe-inline'"],
        imgSrc: ["'self'", "data:", "https:"],
        connectSrc: ["'self'", "https:"],
        frameAncestors: ["'none'"],
      },
    },
    crossOriginEmbedderPolicy: false,
  })
);

// Cross-Origin Resource Sharing (CORS) Security Guard
app.use(
  cors({
    origin: [config.corsOrigin, "http://localhost:3000", "http://localhost:3001"],
    credentials: true,
    methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization", "X-Requested-With"],
  })
);

// Global Rate Limiter: Max 100 requests per 15 minutes per IP
app.use(rateLimiter({ windowMs: 15 * 60 * 1000, maxRequests: 100 }));

// Body Parsers with Strict Byte Length Limits against Buffer Overflow attacks
app.use(express.json({ limit: "1mb" }));
app.use(express.urlencoded({ extended: true, limit: "1mb" }));

// Payload Sanitizer against Script Injections & XSS
app.use(payloadSanitizer);

// Request Logging
app.use(morgan("dev"));

// Health Check Endpoint
app.get("/health", getHealth);
app.get("/api/v1/health", getHealth);

// API v1 Routes
app.use("/api/v1/auth", authRoutes);
app.use("/api/v1/users", userRoutes);
app.use("/api/v1/records", recordRoutes);

// Global Centralized Error Handler
app.use(errorHandler);

export default app;
