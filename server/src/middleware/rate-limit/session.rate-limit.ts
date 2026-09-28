import rateLimit from "express-rate-limit";
import { createRedisStore } from "../redis-store.js";

const isDevelopment = process.env.NODE_ENV !== "production";

export const refreshLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: isDevelopment ? 100 : 60,
  store: createRedisStore(
    isDevelopment ? "rl:dev:refresh-limiter" : "rl:refresh-limiter",
  ),
  handler: (_, res) => {
    res
      .status(429)
      .json({ success: false, message: "Too many refresh attempts" });
  },
});

export const sessionReadLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: isDevelopment ? 500 : 30,
  store: createRedisStore(
    isDevelopment ? "rl:dev:session-read-limiter" : "rl:session-read-limiter",
  ),
  handler: (_, res) => {
    res.status(429).json({ success: false, message: "Too many requests" });
  },
});
