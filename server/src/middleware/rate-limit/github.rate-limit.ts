import rateLimit from "express-rate-limit";
import { createRedisStore } from "../redis-store.js";

const isDevelopment = process.env.NODE_ENV !== "production";

export const githubSyncLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: isDevelopment ? 100 : 5,
  standardHeaders: true,
  legacyHeaders: false,
  store: createRedisStore(
    isDevelopment ? "rl:dev:github-sync" : "rl:github-sync",
  ),
  handler: (_, res) => {
    res.status(429).json({
      success: false,
      message: "Too many sync requests. Please wait before syncing again.",
    });
  },
});

export const githubReadLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: isDevelopment ? 500 : 60,
  standardHeaders: true,
  legacyHeaders: false,
  store: createRedisStore(
    isDevelopment ? "rl:dev:github-read" : "rl:github-read",
  ),
  handler: (_, res) => {
    res.status(429).json({
      success: false,
      message: "Too many requests. Please try again later.",
    });
  },
});
