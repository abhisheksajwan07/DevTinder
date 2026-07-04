import { Router } from "express";

import { requireAccessAuth } from "../../middleware/auth.middleware.js";
import {
  getSessionController,
  logoutAllController,
  logoutController,
  logoutOtherSessionsController,
  refreshController,
} from "./session.controller.js";
import { requireCsrf } from "../../middleware/csrf.middleware.js";

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

export default router;
