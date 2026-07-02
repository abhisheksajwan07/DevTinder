import jwt from "jsonwebtoken";

import { Request, Response, NextFunction } from "express";
import { AppError } from "../utils/AppError.js";
import { AccessTokenPayload } from "../types/jwt.types.js";
import { verifyAccessToken } from "../utils/jwt.js";

export const requireAccessAuth = (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const accessToken = req.cookies?.["accessToken"];
    if (!accessToken) {
      return next(new AppError("Unauthorized", 401));
    }

    const decoded = verifyAccessToken(accessToken) as AccessTokenPayload;

    req.user = {
      userId: decoded.sub,
      sessionId: decoded.sessionId,
    };
    next();
  } catch (error) {
    if (error instanceof jwt.TokenExpiredError) {
      return next(new AppError("Access token expired", 401));
    }
    if (error instanceof jwt.TokenExpiredError) {
      return next(new AppError("Invalid or expired token", 401));
    }
    return next(error);
  }
};
