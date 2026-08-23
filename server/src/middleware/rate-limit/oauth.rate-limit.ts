import rateLimit from "express-rate-limit";
import { createRedisStore } from "../../middleware/redis-store.js";

const isDevelopment = process.env.NODE_ENV !== "production";


export const oauthCallbackLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: isDevelopment ? 500 : 20,
  standardHeaders: true,
  legacyHeaders: false,
  store: createRedisStore(
    isDevelopment ? "rl:dev:oauth-callback" : "rl:oauth-callback",
  ),
  handler: (_, res) => {
    res.status(429).json({
      success: false,
      message: "Too many OAuth attempts. Please try again later.",
    });
  },
});



export const oauthRedirectLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: isDevelopment ? 500 : 30,
  standardHeaders: true,
  legacyHeaders: false,
  store: createRedisStore(
    isDevelopment ? "rl:dev:oauth-redirect" : "rl:oauth-redirect",
  ),
  handler: (_, res) => {
    res.status(429).json({
      success: false,
      message: "Too many requests. Please try again later.",
    });
  },
});
