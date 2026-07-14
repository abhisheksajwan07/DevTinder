import { Router } from "express";

import { requireAccessAuth } from "../../middleware/auth.middleware.js";
import {
  getSessionController,
  logoutAllController,
  logoutController,
  logoutOtherSessionsController,
  refreshController,
  revokeSessionController,
} from "./session.controller.js";
import { requireCsrf } from "../../middleware/csrf.middleware.js";
import { validate } from "../../middleware/validateBody.js";
import { revokeSessionParamsSchema } from "./session.validator.js";
import {
  refreshLimiter,
  sessionReadLimiter,
} from "../../middleware/rate-limit/session.rate-limit.js";

const router = Router();

router.get("/", requireAccessAuth, sessionReadLimiter, getSessionController);
router.post("/refresh", requireCsrf, refreshLimiter, refreshController);
router.post("/logout", requireAccessAuth, requireCsrf, logoutController);
router.post("/logout-all", requireAccessAuth, requireCsrf, logoutAllController);
router.post(
  "/logout-others",
  requireAccessAuth,
  requireCsrf,
  logoutOtherSessionsController,
);

router.post(
  "/:sessionId/revoke",
  requireAccessAuth,
  requireCsrf,
  validate(revokeSessionParamsSchema, "params"),
  revokeSessionController,
);

export default router;
