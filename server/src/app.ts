import express from "express";
import cookieParser from "cookie-parser";
import cors from "cors";
import { httpLogger } from "./middleware/httpLogger.middleware.js";
import { globalErrorHandler } from "./middleware/globalError.middleware.js";

const app = express();
app.use(cors({ origin: true, credentials: true }));
app.use(express.json());
app.use(cookieParser());

// app.use("/auth", authRoutes);
app.use(httpLogger);
app.use(globalErrorHandler);

export default app;