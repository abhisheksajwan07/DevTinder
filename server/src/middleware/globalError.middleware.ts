import { NextFunction, Request, Response } from "express";
import { env } from "../config/env.js";
import { logger } from "../config/logger.js";
import { AppError } from "../utils/AppError.js";

export const globalErrorHandler = (
  err: Error,
  req: Request,
  res: Response,
  _next: NextFunction,
) => {
  const isAppError = err instanceof AppError;
  const statusCode = isAppError ? err.statusCode : 500;
  const status = isAppError ? err.status : "error";

  if (env.NODE_ENV === "dev") {
    logger.error({
      status,
      code: isAppError ? err.code : undefined,
      message: err.message,
      stack: err.stack,
    });

    return res.status(statusCode).json({
      success: false,
      status,
      code: isAppError ? err.code : undefined,
      message: err.message,
      stack: err.stack,
    });
  }

  if (isAppError) {
    logger.error({
      status,
      code: err.code,
      message: err.message,
    });

    return res.status(statusCode).json({
      success: false,
      status,
      code: err.code,
      message: err.message,
    });
  }

  logger.error({
    status: "error",
    message: err.message,
    stack: err.stack,
  });

  return res.status(500).json({
    success: false,
    status: "error",
    message: "Something went wrong",
  });
};