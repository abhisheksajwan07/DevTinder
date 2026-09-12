import rateLimit from "express-rate-limit";
import { createRedisStore } from "../redis-store.js";

const isDevelopment = process.env.NODE_ENV !== "production";

export const feedReadLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: isDevelopment ? 500 : 60,
  skip: () => process.env.ENABLE_LOAD_TEST === "true",
  standardHeaders: true,
  legacyHeaders: false,
  store: createRedisStore(
    isDevelopment ? "rl:dev:feed-read-limiter" : "rl:feed-read-limiter",
  ),
  handler: (_, res) => {
    res.status(429).json({
      success: false,
      message: "Too many feed requests, please try again later",
    });
  },
});
