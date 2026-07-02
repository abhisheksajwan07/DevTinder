import express from "express";
import cookieParser from "cookie-parser";
import cors from "cors";

import { httpLogger } from "./middleware/httpLogger.middleware.js";
import { globalErrorHandler } from "./middleware/globalError.middleware.js";
import authRouter from "./module/auth/auth.route.js";
import "./workers/worker.email.js";
import { globalLimiter } from "./middleware/global.rate-limit.js";
import { serverAdapter } from "./bull-board.js";

const app = express();

app.use(cors({ origin: true, credentials: true }));
app.use(express.json());
app.use(cookieParser());

app.use(globalLimiter);

app.use(httpLogger);
app.use("/admin/queues", serverAdapter.getRouter());
app.use("/v1/auth", authRouter);

app.use(globalErrorHandler);

export default app;
