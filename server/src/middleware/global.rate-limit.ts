import rateLimit from "express-rate-limit";
import { createRedisStore } from "./redis-store.js";

const isDevelopment = process.env.NODE_ENV !== "production";

export const globalLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  // Development includes browser reloads, React Query polling, and OAuth
  // retries. Keep production strict while making local testing practical.
  max: isDevelopment ? 5000 : 100,
  standardHeaders: true,
  legacyHeaders: false,
  store: createRedisStore(isDevelopment ? "rl:dev:global" : "rl:global"),
  handler: (_, res) => {
    res.status(429).json({
      success: false,
      message: "Too many requests. Please try again later.",
    });
  },
});
