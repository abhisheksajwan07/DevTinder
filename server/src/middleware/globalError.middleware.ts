import { NextFunction, Request, Response } from "express";
import { env } from "../config/env.js";
import { logger } from "../config/logger.js";
import { AppError } from "../utils/AppError.js"

export const globalErrorHandler = (
  err: Error,
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  const statusCode = err instanceof AppError ? err.statusCode : 500;
  const status = err instanceof AppError ? err.status : "error";

  if (env.NODE_ENV === "dev") {
    logger.error({
      message: err.message,
      stack: err.stack,
    });
    return res.status(statusCode).json({
      success: false,
      status,
      message: err.message,
      stack: err.stack,
    });
  }

  if (err instanceof AppError) {
    logger.error({
      status,
      message: err.message,
    });

    return res.status(statusCode).json({
      success: false,
      status,
      message: err.message,
    });
  }

  logger.error({
    success: false,
    message: "Something went wrong",
  });
  return res.status(500).json({
    success: false,
    message: "Something went wrong",
  });
};
