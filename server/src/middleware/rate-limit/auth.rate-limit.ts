import rateLimit from "express-rate-limit";

import { createRedisStore } from "../redis-store.js";


export const signupLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 5,
  standardHeaders: true,
  legacyHeaders: false,
  store: createRedisStore("rl:signup"),
  handler: (_, res) => {
    res.status(429).json({
      success: false,
      message: "Too many registration attempts. Please try again later.",
    });
  },
});

export const verifyEmailLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 5,
  standardHeaders: true,
  legacyHeaders: false,
  store: createRedisStore("rl:verify-email"),
  handler: (_, res) => {
    res.status(429).json({
      success: false,
      message: "Too many verification attempts. Please try again later.",
    });
  },
});

export const resendOtpLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 5,
  standardHeaders: true,
  legacyHeaders: false,
  store: createRedisStore("rl:resend-otp"),
  handler: (_, res) => {
    res.status(429).json({
      success: false,
      message: "Too many OTP resend requests. Please try again later.",
    });
  },
});



export const signInLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 5,
  standardHeaders: true,
  legacyHeaders: false,
  store: createRedisStore("rl:signin"),
  handler: (_, res) => {
    res.status(429).json({
      success: false,
      message: "Too many signin attempts. Please try again later.",
    });
  },
});
export const forgotPasswordLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 5,
  standardHeaders: true,
  legacyHeaders: false,
  store: createRedisStore("rl:forgot-password"),
  handler: (_, res) => {
    res.status(429).json({
      success: false,
      message: "Too many forgot password attempts. Please try again later.",
    });
  },
});