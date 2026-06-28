import { Router } from "express";

import { registerController } from "./auth.controller.js";
import { signUpSchema } from "./auth.validator.js";
import { validate } from "../../middleware/validateBody.js";
import { registerRateLimiter } from "../../middleware/rate-limit/signup.ratelimit.js";

const router = Router();

router.post(
  "/signup",
  registerRateLimiter,
  validate(signUpSchema),
  registerController,
);

export default router;
