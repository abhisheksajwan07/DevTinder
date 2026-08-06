import express from "express";
import cookieParser from "cookie-parser";
import cors from "cors";

import { httpLogger } from "./middleware/httpLogger.middleware.js";
import { globalErrorHandler } from "./middleware/globalError.middleware.js";
import authRouter from "./module/auth/auth.route.js";
import sessionRoutes from "./module/session/session.routes.js";
import oauthRoutes from "./module/oauth/oauth.routes.js";
import feedRoutes from "./module/feed/feed.routes.js";
import swipeRoutes from "./module/swipe/swipe.routes.js";
import onboardingRoutes from "./module/onboarding/onboarding.routes.js";
import chatRoutes from "./module/chat/chat.routes.js";
import githubRoutes from "./module/github/github.routes.js";
import profileRoutes from "./module/profile/profile.routes.js";

import { globalLimiter } from "./middleware/global.rate-limit.js";
import { serverAdapter } from "./bull-board.js";
import { env } from "./config/env.js";

const app = express();

app.set("trust proxy", 1);

app.use(cors({ origin: true, credentials: true }));
app.use(express.json());
app.use(cookieParser());

app.use(globalLimiter);

app.use(httpLogger);
if (env.NODE_ENV !== "production") {
  app.use("/admin/queues", serverAdapter.getRouter());
}

app.use("/v1/auth", authRouter);
app.use("/v1/sessions", sessionRoutes);
app.use("/v1/oauth", oauthRoutes);
app.use("/v1/onboarding", onboardingRoutes);
app.use("/v1/feed", feedRoutes);
app.use("/v1/swipes", swipeRoutes);
app.use("/v1/chat", chatRoutes);
app.use("/v1/github", githubRoutes);
app.use("/v1/profiles", profileRoutes);

app.use(globalErrorHandler);

export default app;
