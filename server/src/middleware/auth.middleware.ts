import jwt from "jsonwebtoken";

import { Request, Response, NextFunction } from "express";
import { AppError } from "../utils/AppError.js";
import { AccessTokenPayload } from "../types/jwt.types.js";
import { verifyAccessToken } from "../utils/jwt.js";
import { isSessionBlocklisted } from "../utils/sessionBlocklist.js";

export const requireAccessAuth = async (
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

   
    const revoked = await isSessionBlocklisted(decoded.sessionId);
    if (revoked) {
      return next(new AppError("Session revoked", 401, "SESSION_REVOKED"));
    }
   
    req.user = {
      userId: decoded.sub,
      sessionId: decoded.sessionId,
    };
    next();
  } catch (error) {
    if (error instanceof jwt.TokenExpiredError) {
      return next(new AppError("Access token expired", 401));
    }
    if (error instanceof jwt.JsonWebTokenError) {
      return next(new AppError("Invalid token", 401));
    }
    return next(error);
  }
};
