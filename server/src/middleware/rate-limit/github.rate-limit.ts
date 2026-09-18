import { ipKeyGenerator } from "express-rate-limit";
import rateLimit from "express-rate-limit";
import { createRedisStore } from "../redis-store.js";

const isDevelopment = process.env.NODE_ENV !== "production";
const githubReadWindowMs = 15 * 60 * 1000;
const authenticatedUserKey = (req: { user?: { userId: string }; ip?: string }) =>
  req.user?.userId ?? ipKeyGenerator(req.ip ?? "");

export const githubSyncLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: isDevelopment ? 100 : 5,
  standardHeaders: true,
  legacyHeaders: false,
  store: createRedisStore(
    isDevelopment ? "rl:dev:github-sync" : "rl:github-sync",
  ),
  handler: (_, res) => {
    res.status(429).json({
      success: false,
      message: "Too many sync requests. Please wait before syncing again.",
    });
  },
});

export const githubStatusReadLimiter = rateLimit({
  windowMs: githubReadWindowMs,
  max: isDevelopment ? 500 : 60,
  keyGenerator: authenticatedUserKey,
  standardHeaders: true,
  legacyHeaders: false,
  store: createRedisStore(
    isDevelopment ? "rl:dev:github-status-read" : "rl:github-status-read",
  ),
  handler: (_, res) => {
    res.status(429).json({
      success: false,
      message: "Too many requests. Please try again later.",
    });
  },
});

export const githubProfileReadLimiter = rateLimit({
  windowMs: githubReadWindowMs,
  max: isDevelopment ? 500 : 60,
  keyGenerator: authenticatedUserKey,
  standardHeaders: true,
  legacyHeaders: false,
  store: createRedisStore(
    isDevelopment ? "rl:dev:github-profile-read" : "rl:github-profile-read",
  ),
  handler: (_, res) => {
    res.status(429).json({
      success: false,
      message: "Too many requests. Please try again later.",
    });
  },
});

export const githubFeaturedRepositoriesLimiter = rateLimit({
  windowMs: githubReadWindowMs,
  max: isDevelopment ? 500 : 30,
  keyGenerator: authenticatedUserKey,
  standardHeaders: true,
  legacyHeaders: false,
  store: createRedisStore(
    isDevelopment
      ? "rl:dev:github-featured-repositories"
      : "rl:github-featured-repositories",
  ),
  handler: (_, res) => {
    res.status(429).json({
      success: false,
      message: "Too many repository updates. Please try again later.",
    });
  },
});
