import rateLimit from "express-rate-limit";
import { createRedisStore } from "../../middleware/redis-store.js";



export const oauthCallbackLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 20,
  standardHeaders: true,
  legacyHeaders: false,
  store: createRedisStore("rl:oauth-callback"),
  handler: (_, res) => {
    res.status(429).json({
      success: false,
      message: "Too many OAuth attempts. Please try again later.",
    });
  },
});



export const oauthRedirectLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 30,
  standardHeaders: true,
  legacyHeaders: false,
  store: createRedisStore("rl:oauth-redirect"),
  handler: (_, res) => {
    res.status(429).json({
      success: false,
      message: "Too many requests. Please try again later.",
    });
  },
});
