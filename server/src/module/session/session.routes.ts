import { Router } from "express";

import { requireAccessAuth } from "../../middleware/auth.middleware.js";
import {
  getSessionController,
  logoutAllController,
  logoutController,
  refreshController,
} from "./session.controller.js";
import { requireCsrf } from "../../middleware/csrf.middleware.js";

const router = Router();

router.get("/", requireAccessAuth, getSessionController);
router.post("/refresh", requireCsrf, refreshController);
router.post("/logout", requireAccessAuth, requireCsrf, logoutController);
router.post("/logout-all", requireAccessAuth, requireCsrf, logoutAllController);

export default router;
