import { Request, Response } from "express";

import { sessionService } from "./session.dependencies.js";
import { sendResponse } from "../../utils/sendResponse.js";
import { AppError } from "../../utils/AppError.js";

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
