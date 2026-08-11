import { Request, Response, NextFunction } from "express";

interface RateLimitStore {
  count: number;
  resetTime: number;
}

const ipStore: Map<string, RateLimitStore> = new Map();

/**
 * Custom memory-efficient API Rate Limiter Middleware
 * Protects auth and sensitive write endpoints from Brute Force & DoS attacks.
 */
export function rateLimiter(options: { windowMs: number; maxRequests: number }) {
  const { windowMs, maxRequests } = options;

  return (req: Request, res: Response, next: NextFunction) => {
    const clientIp = (req.headers["x-forwarded-for"] as string) || req.ip || "127.0.0.1";
    const now = Date.now();

    const record = ipStore.get(clientIp);

    if (!record || now > record.resetTime) {
      ipStore.set(clientIp, {
        count: 1,
        resetTime: now + windowMs,
      });
      return next();
    }

    if (record.count >= maxRequests) {
      const retryAfter = Math.ceil((record.resetTime - now) / 1000);
      return res.status(429).json({
        success: false,
        error: `Rate limit exceeded. Too many requests from this IP. Please try again in ${retryAfter} seconds.`,
        retryAfter,
      });
    }

    record.count += 1;
    ipStore.set(clientIp, record);
    next();
  };
}
