import express from "express";
import cookieParser from "cookie-parser";
import cors from "cors";

import { httpLogger } from "./middleware/httpLogger.middleware.js";
import { globalErrorHandler } from "./middleware/globalError.middleware.js";
import authRouter from "./module/auth/auth.route.js";
import sessionRoutes from "./module/session/session.routes.js";
import oauthRouter from "./module/oauth/oauth.routes.js";
import "./workers/worker.email.js";
import { globalLimiter } from "./middleware/global.rate-limit.js";
import { serverAdapter } from "./bull-board.js";

const app = express();

app.set("trust proxy", 1);

app.use(cors({ origin: true, credentials: true }));
app.use(express.json());
app.use(cookieParser());

app.use(globalLimiter);

app.use(httpLogger);
app.use("/admin/queues", serverAdapter.getRouter());
app.use("/v1/auth", authRouter);
app.use("/v1/sessions", sessionRoutes);
app.use("/v1/oauth", oauthRouter);

app.use(globalErrorHandler);

export default app;
