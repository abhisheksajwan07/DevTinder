import rateLimit from "express-rate-limit";

import { createRedisStore } from "../redis-store.js";

export const onboardingLimiter = rateLimit({
  windowMs: 60 * 60 * 1000,
  max: 5,
  standardHeaders: true,
  legacyHeaders: false,
  store: createRedisStore("rl:onbaord-limiter"),
  handler: (_, res) => {
    res.status(429).json({
      success: false,
      message: "Too many onboarding attempts, please try again later",
    });
  },
});
