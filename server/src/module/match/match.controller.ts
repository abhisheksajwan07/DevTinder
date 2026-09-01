import { Request, Response } from "express";
import { AppError } from "../../utils/AppError.js";
import { sendResponse } from "../../utils/sendResponse.js";
import { matchService } from "./match.dependencies.js";

export const getMatchesController = async (req: Request, res: Response) => {
  if (!req.user?.profileId) throw new AppError("Unauthorized", 401);
  const matches = await matchService.getMatches(req.user.profileId);
  sendResponse(res, 200, "Matches fetched successfully", matches);
};
