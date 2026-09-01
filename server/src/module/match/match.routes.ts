import { Router } from "express";
import { requireAccessAuth } from "../../middleware/auth.middleware.js";
import { requireOnboarding } from "../../middleware/onboarding.middleware.js";
import { noCache } from "../../middleware/noCache.middleware.js";
import { getMatchesController } from "./match.controller.js";

const router = Router();
router.get("/", requireAccessAuth, requireOnboarding, noCache, getMatchesController);
export default router;
