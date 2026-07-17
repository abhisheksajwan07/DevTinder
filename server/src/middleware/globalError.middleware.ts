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

  const dbError = (err as any)?.cause ?? err;
  
  const errorLog = {
    status,
    code: isAppError ? err.code : undefined,
    message: err.message,
    userId: (req as any).user?.userId || undefined,
    route: req.originalUrl,
    method: req.method,
    dbCode: dbError?.code,
    constraint: dbError?.constraint,
    detail: dbError?.detail,
    table: dbError?.table,
    schema: dbError?.schema,
    column: dbError?.column,
    stack: env.NODE_ENV === "dev" ? err.stack : undefined,
  };

  // Log only once at the global level
  logger.error(errorLog);

  if (isAppError) {
    return res.status(statusCode).json({
      success: false,
      status,
      code: err.code,
      message: err.message,
      stack: env.NODE_ENV === "dev" ? err.stack : undefined,
    });
  }

  return res.status(500).json({
    success: false,
    status: "error",
    message: "Something went wrong",
    stack: env.NODE_ENV === "dev" ? err.stack : undefined,
  });
};