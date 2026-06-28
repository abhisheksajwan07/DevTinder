import express from "express";
import cookieParser from "cookie-parser";
import cors from "cors";

import { httpLogger } from "./middleware/httpLogger.middleware.js";
import { globalErrorHandler } from "./middleware/globalError.middleware.js";
import authRouter from "./module/auth/auth.route.js";
import "./workers/worker.email.js";


const app = express();

app.use(cors({ origin: true, credentials: true }));
app.use(express.json());
app.use(cookieParser());


app.use(httpLogger);

app.use("/v1/auth", authRouter);

app.use(globalErrorHandler);

export default app;
