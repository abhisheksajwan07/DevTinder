import express from "express";
import cookieParser from "cookie-parser";
import cors from "cors";
import helmet from "helmet";

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
import matchRoutes from "./module/match/match.routes.js";

import { globalLimiter } from "./middleware/global.rate-limit.js";
import {
  metricsHandler,
  metricsMiddleware,
} from "./middleware/metrics.middleware.js";
import { serverAdapter } from "./bull-board.js";
import { env } from "./config/env.js";
import { pool } from "./db/drizzle.js";
import { redis } from "./config/redis.js";

const app = express();

app.disable("x-powered-by");
app.set("trust proxy", 1);
app.use(helmet());


app.get("/metrics", metricsHandler);


app.use(httpLogger);
app.use(metricsMiddleware);



app.get("/health", (_req, res) => {
  res.status(200).json({ status: "ok" });
});

app.get("/ready", async (_req, res) => {
  try {
    await Promise.all([pool.query("SELECT 1"), redis.ping()]);
    res.status(200).json({ status: "ready" });
  } catch {
    res.status(503).json({ status: "not_ready" });
  }
});



const allowedOrigins = new Set(
  [env.CLIENT_URL, ...env.CORS_ALLOWED_ORIGINS.split(",")]
    .map((origin) => origin.trim())
    .filter(Boolean),
);

app.use(
  cors({
    origin(origin, callback) {
      if (!origin || allowedOrigins.has(origin)) {
        return callback(null, true);
      }

      return callback(null, false);
    },
    credentials: true,
  }),
);
app.use(express.json());
app.use(cookieParser());
app.use(globalLimiter);


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
app.use("/v1/matches", matchRoutes);

app.use(globalErrorHandler);

export default app;
