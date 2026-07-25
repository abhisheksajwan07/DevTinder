import { Request, Response } from "express";
import { sendResponse } from "../../utils/sendResponse.js";
import { service as swipeService } from "./swipe.dependencies.js";
import { ProfileParams } from "./swipe.types.js";
import { logger } from "../../config/logger.js";

export const skip = async (req: Request<ProfileParams>, res: Response) => {
  const requesterProfileId = req.user!.profileId!;
  const targetProfileId = req.params.profileId;

  await swipeService.skip(requesterProfileId, targetProfileId);

  return sendResponse(res, 201, "Profile skipped");
};

export const connect = async (req: Request<ProfileParams>, res: Response) => {
  const requesterProfileId = req.user!.profileId!;
  const targetProfileId = req.params.profileId;

  await swipeService.connect(requesterProfileId, targetProfileId);

  return sendResponse(res, 201, "Connection request sent");
};

export const accept = async (req: Request<ProfileParams>, res: Response) => {
  const requesterProfileId = req.params.profileId!;
  const responderProfileId = req.user!.profileId!;

  await swipeService.accept(requesterProfileId, responderProfileId);

  return sendResponse(res, 200, "Connection request accepted");
};

export const reject = async (req: Request<ProfileParams>, res: Response) => {
  const requesterProfileId = req.params.profileId!;
  const responderProfileId = req.user!.profileId!;

  await swipeService.reject(requesterProfileId, responderProfileId);

  return sendResponse(res, 200, "Connection request rejected");
};
