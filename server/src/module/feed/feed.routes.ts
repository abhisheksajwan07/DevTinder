import { Router } from "express";
import { requireAccessAuth } from "../../middleware/auth.middleware.js";
import { requireOnboarding } from "../../middleware/onboarding.middleware.js";
import { feedReadLimiter } from "../../middleware/rate-limit/feed.rate-limit.js";
import { getFeedController } from "./feed.controller.js";
import { validate } from "../../middleware/validateBody.js";
import { getFeedSchema } from "./feed.validator.js";

const router = Router();

router.get(
  "/",
  requireAccessAuth,
  requireOnboarding,
  feedReadLimiter,
  validate(getFeedSchema,"query"),
  getFeedController,
);

export default router