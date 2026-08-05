import rateLimit from "express-rate-limit";
import { createRedisStore } from "../redis-store.js";

export const githubSyncLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 5, 
  standardHeaders: true,
  legacyHeaders: false,
  store: createRedisStore("rl:github-sync"),
  handler: (_, res) => {
    res.status(429).json({
      success: false,
      message: "Too many sync requests. Please wait before syncing again.",
    });
  },
});

export const githubReadLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 60,
  standardHeaders: true,
  legacyHeaders: false,
  store: createRedisStore("rl:github-read"),
  handler: (_, res) => {
    res.status(429).json({
      success: false,
      message: "Too many requests. Please try again later.",
    });
  },
});
