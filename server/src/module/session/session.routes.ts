import { Router } from "express";

import { requireAccessAuth } from "../../middleware/auth.middleware.js";
import {
  getSessionController,
  refreshController,
} from "./session.controller.js";
import { requireCsrf } from "../../middleware/csrf.middleware.js";

const router = Router();

router.get("/", requireAccessAuth, getSessionController);
router.post("/refresh", requireCsrf, refreshController);




export default router;
