import { NextFunction, Request, Response } from "express";

import { AppError } from "../utils/AppError.js";
import { authService } from "../module/auth/auth.dependencies.js";


export const requireOnboarding = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  if (!req.user) {
    throw new AppError("Unauthorized", 401);
  }
  const user = await authService.getMe(req.user.userId);
  if (!user.onBoardingComplete) {
    throw new AppError(
      "Please complete onboarding first",
      403,
      "ONBOARDING_REQUIRED",
    );
  }

  if (!user.profileId) {
    throw new AppError("Profile not found", 404);
  }
  req.user.profileId = user.profileId;
  next();
};
