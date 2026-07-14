import rateLimit from "express-rate-limit";
import { createRedisStore } from "../redis-store.js";


export const refreshLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 10,
  store: createRedisStore("rl:refresh-limiter"),
  handler: (_, res) => {
    res
      .status(429)
      .json({ success: false, message: "Too many refresh attempts" });
  },
});

export const sessionReadLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 30,
  store: createRedisStore("rl:session-read-limiter"),
  handler: (_, res) => {
    res.status(429).json({ success: false, message: "Too many requests" });
  },
});
