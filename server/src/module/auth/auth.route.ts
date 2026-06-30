import { Router } from "express";

import {
  resendVerificationController,
  signInController,
  signUpController,
  verifyEmailController,
} from "./auth.controller.js";
import {
  resendOtpSchema,
  signInSchema,
  signUpSchema,
  verifyEmailSchema,
} from "./auth.validator.js";
import { validate } from "../../middleware/validateBody.js";

import {
  resendOtpLimiter,
  signInLimiter,
  signupLimiter,
  verifyEmailLimiter,
} from "../../middleware/rate-limit/auth.rate-limit.js";

const router = Router();

router.post("/signup", signupLimiter, validate(signUpSchema), signUpController);

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
export default router;
