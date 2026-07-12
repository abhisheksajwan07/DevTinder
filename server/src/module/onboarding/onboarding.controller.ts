import { Request, Response, NextFunction } from "express";
import { OnboardingService } from "./onboarding.service.js";
import { CreateProfileDTO } from "./onboarding.validator.js";
import { sendResponse } from "../../utils/sendResponse.js";
import { service } from "./onboarding.dependencies.js";

export const createProfileController = async (req: Request, res: Response) => {
  if (!req.user) {
    return sendResponse(res, 401, "Unauthorized");
  }

  await service.createProfile(req.user.userId, req.body as CreateProfileDTO);
  sendResponse(res, 201, "Profile created successfully");
};
