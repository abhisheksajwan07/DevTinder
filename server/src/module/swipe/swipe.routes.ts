import { Router } from "express";
import { requireAccessAuth } from "../../middleware/auth.middleware.js";
import { requireOnboarding } from "../../middleware/onboarding.middleware.js";
import { validate } from "../../middleware/validateBody.js";
import { ProfileIdSchema } from "./swipe.validator.js";
import { skip, connect, accept, reject } from "./swipe.controller.js";
import { swipeLimiter } from "../../middleware/rate-limit/swipe.rate-limit.js";
import { requireCsrf } from "../../middleware/csrf.middleware.js";

const router = Router();

router.post(
  "/:profileId/skip",
  requireAccessAuth,requireCsrf,
  requireOnboarding,
  swipeLimiter,
  validate(ProfileIdSchema, "params"),
  skip,
);
router.post(
  "/:profileId/connect",
  requireAccessAuth,requireCsrf,
  requireOnboarding,
  swipeLimiter,
  validate(ProfileIdSchema, "params"),
  connect,
);
router.post(
  "/:profileId/accept",
  requireAccessAuth,requireCsrf,
  requireOnboarding,
  swipeLimiter,
  validate(ProfileIdSchema, "params"),
  accept,
);
router.post(
  "/:profileId/reject",
  requireAccessAuth,requireCsrf,
  requireOnboarding,
  swipeLimiter,
  validate(ProfileIdSchema, "params"),
  reject,
);

export default router