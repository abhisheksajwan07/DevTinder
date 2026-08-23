import { Queue } from "bullmq";
import { bullMQConnection } from "../config/redis.js";

export const GITHUB_SYNC_QUEUE_NAME = "github-sync";

export type GitHubSyncJobData = {
  profileId: string;
};

export const githubSyncQueue = new Queue<GitHubSyncJobData>(
  GITHUB_SYNC_QUEUE_NAME,
  {
    connection: bullMQConnection,
    defaultJobOptions: {
      attempts: 3,
      backoff: {
        type: "exponential",
        delay: 5000,
      },
      removeOnComplete: 100,
      removeOnFail: 200,
    },
  },
);
