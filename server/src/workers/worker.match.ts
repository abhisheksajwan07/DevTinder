import { Worker } from "bullmq";
import { MatchingJobPayload } from "../module/match/match.types.js";
import { MATCH_QUEUE_NAME } from "../queues/matching.queue.js";
import { bullMQConnection } from "../config/redis.js";
import { matchRepository } from "../module/match/match.dependencies.js";
import { logger } from "../config/logger.js";

export const matchingWorker = new Worker<MatchingJobPayload>(
  MATCH_QUEUE_NAME,
  async (job) => {
    await matchRepository.createMatchAndConversation(job.data.connectionId);
  },
  { connection: bullMQConnection },
);

matchingWorker.on("completed", (job) => {
  logger.info(
    {
      jobId: job.id,
      connectionId: job.data.connectionId,
    },
    "Match created successfully.",
  );
});

matchingWorker.on("failed", (job, err) => {
  logger.error(
    {
      jobId: job?.id,
      connectionId: job?.data.connectionId,
      err,
    },
    "Failed to create match.",
  );
});
