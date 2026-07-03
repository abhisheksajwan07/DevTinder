import { Request, Response } from "express";

import { sessionService } from "./session.dependencies.js";
import { sendResponse } from "../../utils/sendResponse.js";
import { AppError } from "../../utils/AppError.js";
import {
  setAccessTokenCookie,
  setCsrfCookie,
  setRefreshTokenCookie,
} from "../../utils/cookie.js";

export const getSessionController = async (req: Request, res: Response) => {
  if (!req.user) {
    throw new AppError("Unauthorized", 401);
  }
  const sessions = await sessionService.getActiveSessions(
    req.user.userId,
    req.user.sessionId,
  );

  sendResponse(res, 201, "active sessions fetched", sessions);
};

export const refreshController = async (req: Request, res: Response) => {
  const rawRefreshToken = req.cookies?.["refreshToken"];
  if (!rawRefreshToken) {
    throw new AppError("Refresh token missing", 401);
  }

  const { accessToken, rawRefreshToken: newRawRefreshToken } =
    await sessionService.refreshSession(rawRefreshToken);

  setAccessTokenCookie(res, accessToken);
  setRefreshTokenCookie(res, newRawRefreshToken);
  setCsrfCookie(res);
  
  sendResponse(res, 200, "token refreshed");
};
