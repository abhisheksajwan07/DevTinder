import { Request, Response, NextFunction } from "express";

import { CreateProfileDTO, UpdateProfileDTO } from "./onboarding.validator.js";
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

export const updateProfileController = async (req: Request, res: Response) => {
  if (!req.user) {
    return sendResponse(res, 401, "Unauthorized");
  }
  await service.updateProfile(req.user.userId, req.body as UpdateProfileDTO);
  sendResponse(res, 200, "Profile updated successfully");
};

export const getOptionsController = async (req: Request, res: Response) => {
  const options = await service.getOptions();
  sendResponse(res, 200, "Options fetched successfully", { options });
};

export const checkUsernameController = async (req: Request, res: Response) => {
  const username = req.query.username as string;

  const available = await service.checkUserName(username);
  sendResponse(res, 200, available ? "Username available" : "Username taken", {
    available,
  });
};
