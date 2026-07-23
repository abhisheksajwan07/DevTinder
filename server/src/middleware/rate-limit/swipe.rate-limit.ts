import rateLimit from "express-rate-limit";
import { createRedisStore } from "../redis-store.js";

export const swipeLimiter = rateLimit({
  windowMs: 60 * 1000,
  max: 120,
  store: createRedisStore("rl:swipe-limiter"),
  keyGenerator: (req) => req.user!.userId, // limit per authenticated user
  handler: (_, res) => {
    res.status(429).json({
      success: false,
      message: "Too many swipe requests. Please try again shortly.",
    });
  },
});
