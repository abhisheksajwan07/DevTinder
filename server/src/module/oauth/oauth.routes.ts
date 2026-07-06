import { Router } from "express";
import {
  googleCallbackController,
  googleRedirectController,
} from "./oauth.controller.js";
import {
  oauthCallbackLimiter,
  oauthRedirectLimiter,
} from "../../middleware/rate-limit/oauth.rate-limit.js";


const router = Router();


router.get("/google", oauthRedirectLimiter, googleRedirectController);

router.get(
  "/google/callback",
  oauthCallbackLimiter,
  googleCallbackController,
);

export default router;
