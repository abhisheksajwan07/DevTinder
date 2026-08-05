import { Router } from "express";
import { onboardingReadLimiter } from "../../middleware/rate-limit/onboarding.rate-limit.js";
import { validate } from "../../middleware/validateBody.js";
import { getPublicProfileController } from "./profile.controller.js";
import { publicProfileParamsSchema } from "./profile.validator.js";

const router = Router();

router.get(
  "/:username",
  onboardingReadLimiter,
  validate(publicProfileParamsSchema, "params"),
  getPublicProfileController,
);

export default router;
