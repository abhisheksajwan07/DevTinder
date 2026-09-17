import { Request, Response } from "express";

import { sessionService } from "./session.dependencies.js";
import { sendResponse } from "../../utils/sendResponse.js";
import { AppError } from "../../utils/AppError.js";
import {
  clearAuthCookies,
  clearCsrfCookie,
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

export const logoutController = async (req: Request, res: Response) => {
  if (!req.user) {
    throw new AppError("Unauthorized", 401);
  }
  const rawAccessToken = req.cookies?.["accessToken"];
  await sessionService.revokeSession(req.user.sessionId, rawAccessToken);
  clearAuthCookies(res);
  clearCsrfCookie(res);
  sendResponse(res, 200, "logout successfully");
};

export const logoutAllController = async (req: Request, res: Response) => {
  if (!req.user) {
    throw new AppError("Unauthorized", 401);
  }

  const rawAccessToken = req.cookies?.["accessToken"];
  await sessionService.revokeAllSessionsByUserId(req.user.userId, rawAccessToken);
  clearAuthCookies(res);
  clearCsrfCookie(res);
  sendResponse(res, 200, "logout from all the devices");
};

export const logoutOtherSessionsController = async (
  req: Request,
  res: Response,
) => {
  if (!req.user) {
    throw new AppError("Unauthorized", 401);
  }

  const rawAccessToken = req.cookies?.["accessToken"];
  await sessionService.revokeOtherSessions(
    req.user.userId,
    req.user.sessionId,
    rawAccessToken,
  );

  sendResponse(res, 200, "Logged out from all other devices");
};

export const revokeSessionController = async (req: Request, res: Response) => {
  if (!req.user) {
    throw new AppError("unauthorized", 401);
  }

  const { sessionId } = req.params;
  if (typeof sessionId !== "string") {
    throw new AppError("Invalid session id", 400);
  }

  if (sessionId === req.user.sessionId) {
    throw new AppError("use Logout endpoint for current session", 400);
  }
  await sessionService.revokeSession(sessionId);
  sendResponse(res, 200, "Session revoked successfully");
};
