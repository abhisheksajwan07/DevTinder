import { Router } from "express";

import {
  resendVerificationController,
  signUpController,
  verifyEmailController,
} from "./auth.controller.js";
import {
  resendOtpSchema,
  signUpSchema,
  verifyEmailSchema,
} from "./auth.validator.js";
import { validate } from "../../middleware/validateBody.js";

import { resendOtpLimiter, signupLimiter, verifyEmailLimiter } from "../../middleware/rate-limit/auth.rate-limit.js";

const router = Router();

router.post(
  "/signup",
  signupLimiter,
  validate(signUpSchema),
  signUpController,
);

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

export default router;
