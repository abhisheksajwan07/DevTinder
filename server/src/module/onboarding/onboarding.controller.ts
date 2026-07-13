import { Request, Response, NextFunction } from "express";

import { CreateProfileDTO } from "./onboarding.validator.js";
import { sendResponse } from "../../utils/sendResponse.js";
import { service } from "./onboarding.dependencies.js";
import { AppError } from "../../utils/AppError.js";

export const createProfileController = async (req: Request, res: Response) => {
  if (!req.user) {
    throw new AppError("Unauthorized", 401);
  }

  await service.createProfile(req.user.userId, req.body as CreateProfileDTO);
  sendResponse(res, 201, "Profile created successfully");
};

export const getMyProfileController = async (req: Request, res: Response) => {
  if (!req.user) {
    return sendResponse(res, 401, "Unauthorized");
  }
  const profile = await service.getMyProfile(req.user.userId);
  sendResponse(res, 200, "Profile fetched successfully", { profile });
};
