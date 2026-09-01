import { AppError } from "../../utils/AppError.js";
import { redis } from "../../config/redis.js";
import { githubSyncQueue } from "../../queues/github-sync.queue.js";
import {
  createEmbeddingJobId,
  embeddingQueue,
} from "../../queues/embedding.queue.js";
import type {
  GitHubConnectionStatus,
  GitHubProfileResponse,
  IGitHubRepository,
} from "./github.types.js";

const MANUAL_SYNC_COOLDOWN_SECONDS = 6 * 60 * 60;

export class GitHubService {
  constructor(private readonly repository: IGitHubRepository) {}

  async getConnectionStatus(userId: string): Promise<GitHubConnectionStatus> {
    return this.repository.getConnectionStatus(userId);
  }

  /**
   * enqueue background sync job for the given profile.
   * Returns immediately — the worker does the heavy lifting.
   */
  async sync(profileId: string): Promise<string> {
    // Verify GitHub is actually connected before queuing
    const account = await this.repository.findGitHubAccount(profileId);

    if (!account) {
      throw new AppError(
        "No GitHub account connected. Please sign in with GitHub first.",
        400,
        "GITHUB_NOT_CONNECTED",
      );
    }

    // rate-limit by authenticated profile, not only by ip. 
    const cooldownKey = `github-sync-cooldown:${profileId}`;
    const lockAcquired = await redis.set(
      cooldownKey,
      "1",
      "EX",
      MANUAL_SYNC_COOLDOWN_SECONDS,
      "NX",
    );

    if (lockAcquired !== "OK") {
      throw new AppError(
        "GitHub was synced recently. Please try again later.",
        429,
        "GITHUB_SYNC_COOLDOWN",
      );
    }

    try {
      const job = await githubSyncQueue.add(
        "github_sync",
        { profileId },
        { jobId: `github-sync-${profileId}-${Date.now()}` },
      );

      return job.id!;
    } catch (error) {
      // Do not make a failed queue submission consume the full cooldown.
      await redis.del(cooldownKey);
      throw error;
    }
  }

  /**
   * Returns the cached GitHub profile and repositories from the database.
   * Never calls the GitHub API.
   */
  async getProfile(profileId: string): Promise<GitHubProfileResponse> {
    const [profile, repositories] = await Promise.all([
      this.repository.getProfile(profileId),
      this.repository.getRepositories(profileId),
    ]);

    if (!profile) {
      throw new AppError(
        "GitHub profile not found. Please trigger a sync first.",
        404,
        "GITHUB_PROFILE_NOT_FOUND",
      );
    }

    return {
      username: profile.username,
      avatarUrl: profile.avatarUrl,
      bio: profile.bio,
      followers: profile.followers,
      publicRepos: profile.publicRepos,
      lastSyncedAt: profile.lastSyncedAt,
      repositories: repositories.map((r) => ({
        id: r.id,
        githubRepoId: r.githubRepoId,
        name: r.name,
        description: r.description,
        language: r.language,
        stars: r.stars,
        htmlUrl: r.htmlUrl,
        isFeatured: r.isFeatured,
      })),
    };
  }

  /**
   * Marks up to 3 repositories as featured.
   * Enforces the 3-repo limit at the service layer.
   */
  async setFeaturedRepositories(
    profileId: string,
    repoIds: string[],
  ): Promise<void> {
    if (repoIds.length > 3) {
      throw new AppError(
        "You can feature a maximum of 3 repositories.",
        400,
        "FEATURED_REPOS_LIMIT",
      );
    }

    await this.repository.setFeaturedRepositories(profileId, repoIds);
    await embeddingQueue.add(
      "generate_embedding",
      { profileId },
      { jobId: createEmbeddingJobId(profileId) },
    );
  }
}
