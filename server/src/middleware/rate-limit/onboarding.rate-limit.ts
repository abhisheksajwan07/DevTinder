import rateLimit from "express-rate-limit";

import { createRedisStore } from "../redis-store.js";

const isDevelopment = process.env.NODE_ENV !== "production";
const readWindowMs = 15 * 60 * 1000;
const developmentReadLimit = 500;

const rateLimitHandler = (_req: unknown, res: any) => {
  res.status(429).json({
    success: false,
    message: "Too many requests, please try again later",
  });
};

const authenticatedUserKey = (req: {
  user?: { userId: string };
  ip?: string;
}) => req.user?.userId ?? req.ip ?? "unknown";

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

export const onboardingProfileReadLimiter = rateLimit({
  windowMs: readWindowMs,
  max: isDevelopment ? developmentReadLimit : 60,
  keyGenerator: authenticatedUserKey,
  standardHeaders: true,
  legacyHeaders: false,
  store: createRedisStore(
    isDevelopment ? "rl:dev:onboard-profile-read" : "rl:onboard-profile-read",
  ),
  handler: rateLimitHandler,
});

export const onboardingOptionsReadLimiter = rateLimit({
  windowMs: readWindowMs,
  max: isDevelopment ? developmentReadLimit : 60,
  keyGenerator: authenticatedUserKey,
  standardHeaders: true,
  legacyHeaders: false,
  store: createRedisStore(
    isDevelopment ? "rl:dev:onboard-options-read" : "rl:onboard-options-read",
  ),
  handler: rateLimitHandler,
});

export const usernameAvailabilityLimiter = rateLimit({
  windowMs: readWindowMs,
  max: isDevelopment ? developmentReadLimit : 30,
  keyGenerator: authenticatedUserKey,
  standardHeaders: true,
  legacyHeaders: false,
  store: createRedisStore(
    isDevelopment ? "rl:dev:username-availability" : "rl:username-availability",
  ),
  handler: rateLimitHandler,
});

export const publicProfileReadLimiter = rateLimit({
  windowMs: readWindowMs,
  max: isDevelopment ? developmentReadLimit : 120,
  standardHeaders: true,
  legacyHeaders: false,
  store: createRedisStore(
    isDevelopment ? "rl:dev:public-profile-read" : "rl:public-profile-read",
  ),
  handler: rateLimitHandler,
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
