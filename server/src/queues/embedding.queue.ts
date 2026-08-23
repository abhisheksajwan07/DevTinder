import { Queue } from "bullmq";
import { bullMQConnection } from "../config/redis.js";

export const EMBEDDING_QUEUE_NAME = "embedding";

export type EmbeddingJobData = {
  profileId: string;
};

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
      removeOnComplete: 100,
      removeOnFail: 200,
    },
  },
);
