import { Router } from "express";
import {
  googleCallbackController,
  googleRedirectController,
  githubRedirectController,
  githubCallbackController,
} from "./oauth.controller.js";
import {
  oauthCallbackLimiter,
  oauthRedirectLimiter,
} from "../../middleware/rate-limit/oauth.rate-limit.js";


const router = Router();


router.get("/google", oauthRedirectLimiter, googleRedirectController);
router.get("/github", oauthRedirectLimiter, githubRedirectController);


router.get(
  "/google/callback",
  oauthCallbackLimiter,
  googleCallbackController,
);

router.get(
  "/github/callback",
  oauthCallbackLimiter,
  githubCallbackController,
);

export default router;
