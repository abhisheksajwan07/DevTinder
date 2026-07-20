import { NextFunction, Request, Response } from "express";
import { logger } from "../config/logger.js";
import { getPostgresError } from "../errors/postgres-error.js";
import { AppError } from "../utils/AppError.js";

export const globalErrorHandler = (
  err: unknown,
  req: Request,
  res: Response,
  _next: NextFunction,
) => {
  const isAppError = err instanceof AppError;
  const statusCode = isAppError ? err.statusCode : 500;
  const status = isAppError ? err.status : "error";
  const dbError = getPostgresError(err);
  const message = err instanceof Error ? err.message : "A non-error value was thrown";
  const stack = err instanceof Error ? err.stack : undefined;

  const errorLog = {
    status,
    code: isAppError ? err.code : undefined,
    message,
    userId: req.user?.userId,
    route: req.originalUrl,
    method: req.method,
    dbCode: dbError?.code,
    constraint: dbError?.constraint,
    detail: dbError?.detail,
    table: dbError?.table,
    schema: dbError?.schema,
    column: dbError?.column,
    stack,
  };

  // Log only once at the global level
  logger.error(errorLog);

  if (isAppError) {
    return res.status(statusCode).json({
      success: false,
      status,
      code: err.code,
      message: err.message,
    });
  }

  return res.status(500).json({
    success: false,
    status: "error",
    message: "Something went wrong",
  });
};
