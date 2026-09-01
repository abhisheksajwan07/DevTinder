import { Queue } from "bullmq";
import { randomUUID } from "node:crypto";
import { bullMQConnection } from "../config/redis.js";

export const EMBEDDING_QUEUE_NAME = "embedding";

export type EmbeddingJobData = {
  profileId: string;
};

// Every enqueue represents a new profile snapshot. The worker's
// embeddingVersion check prevents older snapshots from overwriting newer data.
export const createEmbeddingJobId = (profileId: string): string =>
  `generate-embedding-${profileId}-${Date.now()}-${randomUUID()}`;

export const embeddingQueue = new Queue<EmbeddingJobData>(
  EMBEDDING_QUEUE_NAME,
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
