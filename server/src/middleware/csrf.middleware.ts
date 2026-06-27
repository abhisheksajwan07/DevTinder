import { Request, Response, NextFunction } from "express";
import { AppError } from "../utils/AppError.js";

export const requireCsrf = (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  const cookieToken = req.cookies?.["csrfToken"];
  const headerToken = req.headers["x-csrf-token"];
  if (!cookieToken || !headerToken || cookieToken !== headerToken) {
    next(new AppError("CSRF TOKEN msissing", 403));
  }
  return next();
};
