import rateLimit from "express-rate-limit";
import type { Request, Response } from "express";
import { GLOBAL_RATE_LIMIT_MAX, GLOBAL_RATE_LIMIT_WINDOW_MS, WRITE_RATE_LIMIT_MAX, WRITE_RATE_LIMIT_WINDOW_MS } from "../config/constants.js";

const rateLimitedResponse = (_req: Request, res: Response) => {
  res.status(429).json({
    success: false,
    error: { code: "RATE_LIMITED", message: "Too many requests, please try again later." },
  });
};

export const globalLimiter = rateLimit({
  windowMs: GLOBAL_RATE_LIMIT_WINDOW_MS,
  limit: GLOBAL_RATE_LIMIT_MAX,
  standardHeaders: true,
  legacyHeaders: false,
  skip: (req) => req.path === "/health",
  handler: rateLimitedResponse,
});

const writeLimit = process.env.NODE_ENV === "test" && process.env.RATE_LIMIT_WRITE_TEST ? Number(process.env.RATE_LIMIT_WRITE_TEST) : WRITE_RATE_LIMIT_MAX;

export const writeLimiter = rateLimit({
  windowMs: WRITE_RATE_LIMIT_WINDOW_MS,
  limit: writeLimit,
  standardHeaders: true,
  legacyHeaders: false,
  handler: rateLimitedResponse,
});
