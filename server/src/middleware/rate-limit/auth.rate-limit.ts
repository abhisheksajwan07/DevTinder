import rateLimit from "express-rate-limit";

import { createRedisStore } from "../redis-store.js";

const isDevelopment = process.env.NODE_ENV !== "production";

export const signupLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: isDevelopment ? 100 : 5,
  standardHeaders: true,
  legacyHeaders: false,
  store: createRedisStore(isDevelopment ? "rl:dev:signup" : "rl:signup"),
  handler: (_, res) => {
    res.status(429).json({
      success: false,
      message: "Too many registration attempts. Please try again later.",
    });
  },
});

export const verifyEmailLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: isDevelopment ? 100 : 5,
  standardHeaders: true,
  legacyHeaders: false,
  store: createRedisStore(
    isDevelopment ? "rl:dev:verify-email" : "rl:verify-email",
  ),
  handler: (_, res) => {
    res.status(429).json({
      success: false,
      message: "Too many verification attempts. Please try again later.",
    });
  },
});

export const resendOtpLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: isDevelopment ? 100 : 5,
  standardHeaders: true,
  legacyHeaders: false,
  store: createRedisStore(
    isDevelopment ? "rl:dev:resend-otp" : "rl:resend-otp",
  ),
  handler: (_, res) => {
    res.status(429).json({
      success: false,
      message: "Too many OTP resend requests. Please try again later.",
    });
  },
});



export const signInLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: isDevelopment ? 100 : 5,
  standardHeaders: true,
  legacyHeaders: false,
  store: createRedisStore(isDevelopment ? "rl:dev:signin" : "rl:signin"),
  handler: (_, res) => {
    res.status(429).json({
      success: false,
      message: "Too many signin attempts. Please try again later.",
    });
  },
});
export const forgotPasswordLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: isDevelopment ? 100 : 5,
  standardHeaders: true,
  legacyHeaders: false,
  store: createRedisStore(
    isDevelopment ? "rl:dev:forgot-password" : "rl:forgot-password",
  ),
  handler: (_, res) => {
    res.status(429).json({
      success: false,
      message: "Too many forgot password attempts. Please try again later.",
    });
  },
});

export const resetPasswordLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: isDevelopment ? 100 : 10,
  standardHeaders: true,
  legacyHeaders: false,
  store: createRedisStore(
    isDevelopment ? "rl:dev:reset-password" : "rl:reset-password",
  ),
  handler: (_, res) => {
    res.status(429).json({
      success: false,
      message: "Too many reset password attempts. Please try again later.",
    });
  },
});
