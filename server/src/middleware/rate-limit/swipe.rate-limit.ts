import rateLimit from "express-rate-limit";
import { createRedisStore } from "../redis-store.js";

const isDevelopment = process.env.NODE_ENV !== "production";

export const swipeLimiter = rateLimit({
  windowMs: 60 * 1000,
  max: isDevelopment ? 1000 : 120,
  store: createRedisStore(
    isDevelopment ? "rl:dev:swipe-limiter" : "rl:swipe-limiter",
  ),
  keyGenerator: (req) => req.user!.userId, // limit per authenticated user
  handler: (_, res) => {
    res.status(429).json({
      success: false,
      message: "Too many swipe requests. Please try again shortly.",
    });
  },
});
