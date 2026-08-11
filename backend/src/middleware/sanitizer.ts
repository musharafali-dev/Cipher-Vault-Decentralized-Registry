import { Request, Response, NextFunction } from "express";

/**
 * XSS & HTML Entity Input Sanitizer
 * Strips script tags, HTML injections, and dangerous characters from incoming request payloads.
 */
function sanitizeValue(value: any): any {
  if (typeof value === "string") {
    return value
      .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, "")
      .replace(/on\w+="[^"]*"/gi, "")
      .replace(/javascript:/gi, "")
      .trim();
  }
  if (typeof value === "object" && value !== null) {
    for (const key of Object.keys(value)) {
      value[key] = sanitizeValue(value[key]);
    }
  }
  return value;
}

export function payloadSanitizer(req: Request, res: Response, next: NextFunction) {
  if (req.body) {
    req.body = sanitizeValue(req.body);
  }
  if (req.query) {
    req.query = sanitizeValue(req.query);
  }
  next();
}
