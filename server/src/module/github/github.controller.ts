import { Request, Response } from "express";
import { AppError } from "../../utils/AppError.js";
import { sendResponse } from "../../utils/sendResponse.js";
import { githubService } from "./github.dependencies.js";

/**
 * POST /github/sync
 * Enqueues a background sync job. Returns 202 immediately.
 */
export const syncGitHubController = async (
  req: Request,
  res: Response,
): Promise<void> => {
  if (!req.user?.profileId) {
    throw new AppError("Unauthorized", 401);
  }

  const profileId: string = req.user.profileId;

  await githubService.sync(profileId);

  sendResponse(res, 202, "GitHub sync started", { status: "sync_started" });
};

/**
 * GET /github/status
 * Returns whether a GitHub OAuth account is connected to the user.
 *  available this before onboarding is complete.
 */
export const getGitHubStatusController = async (
  req: Request,
  res: Response,
): Promise<void> => {
  if (!req.user?.userId) {
    throw new AppError("Unauthorized", 401);
  }

  const status = await githubService.getConnectionStatus(req.user.userId);
  sendResponse(res, 200, "GitHub status fetched", status);
};

/**
 * GET /github/profile
 * Returns cached GitHub profile + repositories from PostgreSQL.
 * Never calls the GitHub API.
 */
export const getGitHubProfileController = async (
  req: Request,
  res: Response,
): Promise<void> => {
  if (!req.user?.profileId) {
    throw new AppError("Unauthorized", 401);
  }

  const profileId: string = req.user.profileId;

  const profile = await githubService.getProfile(profileId);

  sendResponse(res, 200, "GitHub profile fetched", { github: profile });
};

/**
 * PATCH /github/repositories/featured
 * Body: { repositoryIds: string[] }   (max 3)
 */
export const setFeaturedRepositoriesController = async (
  req: Request,
  res: Response,
): Promise<void> => {
  if (!req.user?.profileId) {
    throw new AppError("Unauthorized", 401);
  }

  const profileId: string = req.user.profileId;

  const { repositoryIds } = req.body as { repositoryIds: string[] };

  await githubService.setFeaturedRepositories(profileId, repositoryIds);

  sendResponse(res, 200, "Featured repositories updated");
};
