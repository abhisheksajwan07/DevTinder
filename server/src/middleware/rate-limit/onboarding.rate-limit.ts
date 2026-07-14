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

export const onboardingReadLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, 
  standardHeaders: true,
  legacyHeaders: false,
  store: createRedisStore("rl:onboard-read-limiter"),
  handler: (_, res) => {
    res.status(429).json({
      success: false,
      message: "Too many requests, please try again later",
    });
  },
});

export const onboardingPatchLimiter = rateLimit({
  windowMs: 60 * 60 * 1000,
  max: 10,
  standardHeaders: true,
  legacyHeaders: false,
  store: createRedisStore("rl:onboardPatch-limiter"),
  handler: (_, res) => {
    res.status(429).json({
      success: false,
      message: "Too many onboarding attempts, please try again later",
    });
  },
});


