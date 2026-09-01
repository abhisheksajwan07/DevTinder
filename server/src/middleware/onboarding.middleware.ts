import { AppError } from "../utils/AppError.js";

import { authService } from "../module/auth/auth.dependencies.js";
import { repository as onboardingRepository } from "../module/onboarding/onboarding.dependencies.js";
import { NextFunction, Request, Response } from "express";

export const requireOnboarding = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  if (!req.user) {
    return next(new AppError("Unauthorized", 401));
  }
  const user = await authService.getMe(req.user.userId);
  if (!user.onBoardingComplete) {
    return next(
      new AppError(
        "Please complete onboarding first",
        403,
        "ONBOARDING_REQUIRED",
      ),
    );
  }
  const profileId = await onboardingRepository.getProfileId(req.user.userId);
  if (!profileId) {
    return next(new AppError("Profile not found", 404));
  }
  req.user.profileId = profileId;
  next();
};
