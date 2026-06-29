import { Router } from "express";

import { signUpController, verifyEmailController } from "./auth.controller.js";
import { signUpSchema, verifyEmailSchema } from "./auth.validator.js";
import { validate } from "../../middleware/validateBody.js";
import { signupRateLimiter } from "../../middleware/rate-limit/signup.ratelimit.js";
import { verifyEmailLimiter } from "../../middleware/rate-limit/verify.ratelimit.js";

const router = Router();

router.post(
  "/signup",
  signupRateLimiter,
  validate(signUpSchema),
  signUpController,
);

router.post(
  "/verify-email",
  verifyEmailLimiter,
  validate(verifyEmailSchema),
  verifyEmailController,
);
export default router;
