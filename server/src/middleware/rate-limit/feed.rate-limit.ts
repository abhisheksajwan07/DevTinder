import rateLimit from "express-rate-limit";
import { createRedisStore } from "../redis-store.js";

export const feedReadLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 60,
  standardHeaders: true,
  legacyHeaders: false,
  store: createRedisStore("rl:feed-read-limiter"),
  handler: (_, res) => {
    res.status(429).json({
      success: false,
      message: "Too many feed requests, please try again later",
    });
  },
});
