/**
 * testApp.ts — creates a fresh Express app instance for integration tests.
 *
 * WHY a separate factory instead of importing app.ts directly?
 * - Avoids module-level side effects running before mocks are set up
 * - Lets each test file get a clean app instance
 * - Makes it easy to inject test-specific middleware if needed
 *
 * Usage in tests:
 *   import { createTestApp } from "../setup/testApp.js";
 *   const app = await createTestApp();
 *   const res = await request(app).get("/v1/auth/me");
 */

import express, { type Application } from "express";
import cookieParser from "cookie-parser";
import cors from "cors";
import { globalErrorHandler } from "../../middleware/globalError.middleware.js";

// Route imports
import authRouter from "../../module/auth/auth.route.js";
import sessionRoutes from "../../module/session/session.routes.js";
import feedRoutes from "../../module/feed/feed.routes.js";
import swipeRoutes from "../../module/swipe/swipe.routes.js";
import onboardingRoutes from "../../module/onboarding/onboarding.routes.js";
import chatRoutes from "../../module/chat/chat.routes.js";
import profileRoutes from "../../module/profile/profile.routes.js";
import matchRoutes from "../../module/match/match.routes.js";
import githubRoutes from "../../module/github/github.routes.js";
import oauthRoutes from "../../module/oauth/oauth.routes.js";

export function createTestApp(): Application {
  const app = express();

  // Core middleware
  app.use(cors({ origin: true, credentials: true }));
  app.use(express.json());
  app.use(cookieParser());

  // Routes — mirror app.ts but without rate-limiter / logger / bull-board
  // (those are mocked in vitest.setup.ts)
  app.use("/v1/auth", authRouter);
  app.use("/v1/sessions", sessionRoutes);
  app.use("/v1/oauth", oauthRoutes);
  app.use("/v1/onboarding", onboardingRoutes);
  app.use("/v1/feed", feedRoutes);
  app.use("/v1/swipes", swipeRoutes);
  app.use("/v1/chat", chatRoutes);
  app.use("/v1/profiles", profileRoutes);
  app.use("/v1/matches", matchRoutes);
  app.use("/v1/github", githubRoutes);

  // Global error handler must be last
  app.use(globalErrorHandler);

  return app;
}
