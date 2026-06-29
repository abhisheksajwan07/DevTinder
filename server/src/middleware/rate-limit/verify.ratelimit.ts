import rateLimit from "express-rate-limit";
import { RedisStore } from "rate-limit-redis";
import { redis } from "../../config/redis.js";

export const verifyEmailLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 5,
  standardHeaders: true,
  legacyHeaders: false,
  store: new RedisStore({
    sendCommand: async (...args: string[]) => {
      const [command, ...rest] = args;
      return redis.call(command!, ...rest) as Promise<any>;
    },
    prefix: "rl:verify",
  }),
  handler: (_, res) => {
    res.status(429).json({
      success: false,
      message: "Too many registration attempts. Please try again later.",
    });
  },
});
