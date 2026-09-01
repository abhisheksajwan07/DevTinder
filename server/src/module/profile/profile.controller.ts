import { Request, Response } from "express";
import { sendResponse } from "../../utils/sendResponse.js";
import { service } from "../onboarding/onboarding.dependencies.js";

export const getPublicProfileController = async (
  req: Request,
  res: Response,
): Promise<void> => {
  const profile = await service.getProfileByUsername(
    String(req.params.username),
  );

  const {
    userId: _userId,
    embeddingStatus: _embeddingStatus,
    embeddingUpdatedAt: _embeddingUpdatedAt,
    embeddingVector: _embeddingVector,
    embeddingVersion: _embeddingVersion,
    createdAt: _createdAt,
    updatedAt: _updatedAt,
    ...publicProfile
  } = profile;

  sendResponse(res, 200, "Profile fetched successfully", {
    profile: publicProfile,
  });
};
