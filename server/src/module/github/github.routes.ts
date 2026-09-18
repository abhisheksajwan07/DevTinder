import { Router } from "express";
import { requireAccessAuth } from "../../middleware/auth.middleware.js";
import { requireOnboarding } from "../../middleware/onboarding.middleware.js";
import { requireCsrf } from "../../middleware/csrf.middleware.js";
import { validate } from "../../middleware/validateBody.js";
import {
  githubSyncLimiter,
  githubStatusReadLimiter,
  githubProfileReadLimiter,
  githubFeaturedRepositoriesLimiter,
} from "../../middleware/rate-limit/github.rate-limit.js";
import {
  getGitHubStatusController,
  syncGitHubController,
  getGitHubProfileController,
  setFeaturedRepositoriesController,
} from "./github.controller.js";
import { featuredRepositoriesSchema } from "./github.validator.js";

const router = Router();

router.get(
  "/status",
  requireAccessAuth,
  githubStatusReadLimiter,
  getGitHubStatusController,
);

router.use(requireAccessAuth, requireOnboarding);

router.post("/sync", requireCsrf, githubSyncLimiter, syncGitHubController);

router.get("/profile", githubProfileReadLimiter, getGitHubProfileController);

router.patch(
  "/repositories/featured",
  requireCsrf,
  githubFeaturedRepositoriesLimiter,
  validate(featuredRepositoriesSchema),
  setFeaturedRepositoriesController,
);

export default router;
