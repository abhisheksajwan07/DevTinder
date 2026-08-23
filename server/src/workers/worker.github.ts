import { Worker } from "bullmq";
import { bullMQConnection } from "../config/redis.js";
import { logger } from "../config/logger.js";
import {
  GITHUB_SYNC_QUEUE_NAME,
  type GitHubSyncJobData,
} from "../queues/github-sync.queue.js";
import { embeddingQueue } from "../queues/embedding.queue.js";
import { githubApiClient, githubRepository } from "../module/github/github.dependencies.js";

export const githubSyncWorker = new Worker<GitHubSyncJobData>(
  GITHUB_SYNC_QUEUE_NAME,
  async (job) => {
    const { profileId } = job.data;

    logger.info(
      { profileId },
      "[GitHubWorker] Sync job received",
    );


    const account = await githubRepository.findGitHubAccount(profileId);

    if (!account) {

      logger.warn(
        { profileId },
        "[GitHubWorker] No GitHub account found — skipping sync",
      );
      await embeddingQueue.add(
        "generate_embedding",
        { profileId },
        { jobId: `generate-embedding-${profileId}` },
      );
      return;
    }


    const accessToken = await githubApiClient.getValidAccessToken(account);


    const githubUser = await githubApiClient.getProfile(accessToken);
    const apiRepos = await githubApiClient.getRepositories(accessToken);


    await githubRepository.syncGitHubData(
      profileId,
      {
        githubId: githubUser.id.toString(),
        username: githubUser.login,
        avatarUrl: githubUser.avatar_url,
        bio: githubUser.bio,
        followers: githubUser.followers,
        publicRepos: githubUser.public_repos,
        lastSyncedAt: new Date(),
      },
      apiRepos.map((r) => ({
        githubRepoId: r.id,
        name: r.name,
        description:
          r.description?.trim() || `${r.name} repository on GitHub`,
        language: r.language,
        stars: r.stargazers_count,
        htmlUrl: r.html_url,
        repoUpdatedAt: new Date(r.updated_at),
      })),
    );


    await embeddingQueue.add(
      "generate_embedding",
      { profileId },
      { jobId: `generate-embedding-${profileId}` },
    );

    logger.info(
      { profileId, repoCount: apiRepos.length },
      "[GitHubWorker] Repositories synced — done",
    );
  },
  {
    connection: bullMQConnection,
    concurrency: 3,
  },
);



githubSyncWorker.on("failed", (job, err) => {
  logger.error(
    { err, profileId: job?.data.profileId, jobId: job?.id },
    "[GitHubWorker] Job failed",
  );
});

githubSyncWorker.on("completed", (job) => {
  logger.info(
    { jobId: job.id, profileId: job.data.profileId },
    "[GitHubWorker] Job completed",
  );
});
