import { Router } from "express";
import { validate } from "../../middleware/validateBody.js";
import { requireAccessAuth } from "../../middleware/auth.middleware.js";
import {
  onboardingLimiter,
  onboardingReadLimiter,
} from "../../middleware/rate-limit/onboarding.rate-limit.js";
import { createProfileSchema } from "./onboarding.validator.js";
import {
  createProfileController,
  getMyProfileController,
} from "./onboarding.controller.js";
import { requireCsrf } from "../../middleware/csrf.middleware.js";
import { requireOnboarding } from "../../middleware/onboarding.middleware.js";
const router = Router();
router.post(
  "/",
  requireAccessAuth,
  requireCsrf,
  onboardingLimiter,
  validate(createProfileSchema),
  createProfileController,
);

router.get(
  "/me",
  requireAccessAuth,
  requireOnboarding,
  onboardingReadLimiter,
  getMyProfileController,
);

export default router;
