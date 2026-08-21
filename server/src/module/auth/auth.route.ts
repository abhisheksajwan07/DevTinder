import { Router } from "express";

import {
  forgotPasswordController,
  resendVerificationController,
  resetPasswordController,
  signInController,
  signUpController,
  verifyEmailController,
  getMeController,
} from "./auth.controller.js";
import {
  forgotPasswordSchema,
  resendOtpSchema,
  resetPasswordSchema,
  signInSchema,
  signUpSchema,
  verifyEmailSchema,
} from "./auth.validator.js";
import { validate } from "../../middleware/validateBody.js";
import { requireAccessAuth } from "../../middleware/auth.middleware.js";

import {
  forgotPasswordLimiter,
  resetPasswordLimiter,
  resendOtpLimiter,
  signInLimiter,
  signupLimiter,
  verifyEmailLimiter,
} from "../../middleware/rate-limit/auth.rate-limit.js";

const router = Router();

router.post("/signup", signupLimiter, validate(signUpSchema), signUpController);

router.get("/me", requireAccessAuth, getMeController);

router.post(
  "/verify-email",
  verifyEmailLimiter,
  validate(verifyEmailSchema),
  verifyEmailController,
);

router.post(
  "/resend-verification-otp",
  resendOtpLimiter,
  validate(resendOtpSchema),
  resendVerificationController,
);

router.post("/signin", signInLimiter, validate(signInSchema), signInController);

router.post(
  "/forgot-password",
  forgotPasswordLimiter,
  validate(forgotPasswordSchema),
  forgotPasswordController,
);
router.post(
  "/reset-password",
  resetPasswordLimiter,
  validate(resetPasswordSchema),
  resetPasswordController,
);
export default router;
