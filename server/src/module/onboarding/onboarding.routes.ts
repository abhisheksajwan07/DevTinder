import { Router } from "express";
import { validate } from "../../middleware/validateBody.js";
import { requireAccessAuth } from "../../middleware/auth.middleware.js";
import { onboardingLimiter } from "../../middleware/rate-limit/onboarding.rate-limit.js";
import { createProfileSchema } from "./onboarding.validator.js";
import { createProfileController } from "./onboarding.controller.js";
const router = Router();
router.post(
  "/",
  requireAccessAuth,
  onboardingLimiter,
  validate(createProfileSchema),
  createProfileController,
);

export default router