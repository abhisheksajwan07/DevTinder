import rateLimit from "express-rate-limit";

import { createRedisStore } from "../redis-store.js";

const isDevelopment = process.env.NODE_ENV !== "production";

export const onboardingLimiter = rateLimit({
  windowMs: 60 * 60 * 1000,
  max: isDevelopment ? 500 : 5,
  standardHeaders: true,
  legacyHeaders: false,
  store: createRedisStore(
    isDevelopment ? "rl:dev:onbaord-limiter" : "rl:onbaord-limiter",
  ),
  handler: (_, res) => {
    res.status(429).json({
      success: false,
      message: "Too many onboarding attempts, please try again later",
    });
  },
});

export const onboardingReadLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: isDevelopment ? 500 : 5,
  standardHeaders: true,
  legacyHeaders: false,
  store: createRedisStore(
    isDevelopment ? "rl:dev:onboard-read-limiter" : "rl:onboard-read-limiter",
  ),
  handler: (_, res) => {
    res.status(429).json({
      success: false,
      message: "Too many requests, please try again later",
    });
  },
});

export const onboardingPatchLimiter = rateLimit({
  windowMs: 60 * 60 * 1000,
  max: isDevelopment ? 500 : 10,
  standardHeaders: true,
  legacyHeaders: false,
  store: createRedisStore(
    isDevelopment ? "rl:dev:onboardPatch-limiter" : "rl:onboardPatch-limiter",
  ),
  handler: (_, res) => {
    res.status(429).json({
      success: false,
      message: "Too many onboarding attempts, please try again later",
    });
  },
});


