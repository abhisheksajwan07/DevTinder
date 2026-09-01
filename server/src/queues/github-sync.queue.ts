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
      // Keep jobs visible in the dashboard long enough to inspect them.
      // Plain count-only removal wipes jobs immediately after completion.
      removeOnComplete: { count: 100, age: 60 * 60 },      // 1 hour
      removeOnFail: { count: 200, age: 24 * 60 * 60 },     // 24 hours
    },
  },
);
