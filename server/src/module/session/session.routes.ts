import { Router } from "express";

import { requireAccessAuth } from "../../middleware/auth.middleware.js";
import { getSessionController } from "./session.controller.js";

 const router = Router();

router.get("/", requireAccessAuth, getSessionController);


export default router