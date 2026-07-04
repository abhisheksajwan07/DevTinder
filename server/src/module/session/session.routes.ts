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

const router = Router();

router.get("/", requireAccessAuth, getSessionController);
router.post("/refresh", requireCsrf, refreshController);
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
