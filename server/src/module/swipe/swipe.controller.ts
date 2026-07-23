import { Request, Response } from "express";
import { sendResponse } from "../../utils/sendResponse.js";
import { service as swipeService } from "./swipe.dependencies.js";
import { ProfileParams } from "./swipe.types.js";
import { logger } from "../../config/logger.js";

export const skip = async (req: Request<ProfileParams>, res: Response) => {
  
  const actorProfileId = req.user!.profileId!;
  const targetProfileId = req.params.profileId;

  await swipeService.skip(actorProfileId, targetProfileId);

  return sendResponse(res, 201, "Profile skipped");
};

export const connect = async (req: Request<ProfileParams>, res: Response) => {
  const actorProfileId = req.user!.profileId!;
  const targetProfileId = req.params.profileId;

  await swipeService.connect(actorProfileId, targetProfileId);

  return sendResponse(res, 201, "Connection request sent");
};

export const accept = async (req: Request<ProfileParams>, res: Response) => {
   const actorProfileId = req.user!.profileId!;
  const targetProfileId = req.params.profileId;

  await swipeService.accept(actorProfileId, targetProfileId);

  return sendResponse(res, 200, "Connection request accepted");
};

export const reject = async (req: Request<ProfileParams>, res: Response) => {
  const targetProfileId = req.user!.profileId!;
  const actorProfileId = req.params.profileId;

  await swipeService.reject(actorProfileId, targetProfileId);

  return sendResponse(res, 200, "Connection request rejected");
};
