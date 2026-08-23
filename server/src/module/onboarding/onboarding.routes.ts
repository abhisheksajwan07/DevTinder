import { Router } from "express";
import { validate } from "../../middleware/validateBody.js";
import { requireAccessAuth } from "../../middleware/auth.middleware.js";
import {
  onboardingLimiter,
  onboardingPatchLimiter,
  onboardingReadLimiter,
} from "../../middleware/rate-limit/onboarding.rate-limit.js";
import {
  checkUsernameSchema,
  createProfileSchema,
} from "./onboarding.validator.js";
import {
  checkUsernameController,
  createProfileController,
  getMyProfileController,
  getOptionsController,
  updateProfileController,
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
router.patch(
  "/me",
  requireAccessAuth,
  requireCsrf,
  requireOnboarding,
  onboardingPatchLimiter,
  updateProfileController,
);
router.get(
  "/options",
  requireAccessAuth,
  onboardingReadLimiter,
  getOptionsController,
);
router.get(
  "/check-username",
  requireAccessAuth,
  onboardingReadLimiter,
  validate(checkUsernameSchema, "query"),
  checkUsernameController,
);
export default router;
