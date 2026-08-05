import { Router } from "express";
import {
  googleCallbackController,
  googleRedirectController,
  githubRedirectController,
  githubCallbackController,
  githubConnectRedirectController,
  githubConnectCallbackController,
} from "./oauth.controller.js";
import { requireAccessAuth } from "../../middleware/auth.middleware.js";
import {
  oauthCallbackLimiter,
  oauthRedirectLimiter,
} from "../../middleware/rate-limit/oauth.rate-limit.js";


const router = Router();


router.get("/google", oauthRedirectLimiter, googleRedirectController);
router.get("/github", oauthRedirectLimiter, githubRedirectController);
router.get(
  "/github/connect",
  requireAccessAuth,
  oauthRedirectLimiter,
  githubConnectRedirectController,
);


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
router.get(
  "/github/connect/callback",
  requireAccessAuth,
  oauthCallbackLimiter,
  githubConnectCallbackController,
);

export default router;
