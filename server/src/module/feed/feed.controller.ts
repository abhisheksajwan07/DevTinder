import { Request, Response } from "express";

import { feedService } from "./feed.dependencies.js";
import { AppError } from "../../utils/AppError.js";
import { sendResponse } from "../../utils/sendResponse.js";

export const getFeedController = async (
  req: Request,
  res: Response,
): Promise<void> => {
  if (!req.user) {
    throw new AppError("Unauthorized", 401);
  }
  const { limit } = req.query as unknown as { limit: number };
  const userId = req.user.userId;

  const result = await feedService.getFeed(userId, { limit });
  res.setHeader("Cache-Control", "no-store");
  sendResponse(res, 200, "Feed fetched successfully", result);
};
