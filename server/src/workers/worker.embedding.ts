import { Worker } from "bullmq";
import { db, profiles } from "../db/drizzle.js";
import { repository } from "../module/onboarding/onboarding.dependencies.js";
import {
  EMBEDDING_QUEUE_NAME,
  EmbeddingJobData,
  embeddingQueue,
} from "../queues/embedding.queue.js";
import { logger } from "../config/logger.js";
import { and, eq, or } from "drizzle-orm";
import { generateEmbedding } from "../config/voyage.js";
import { buildProfileCorpus } from "../utils/buildProfileCorpus.js";
import { bullMQConnection } from "../config/redis.js";

export const embeddingWorker = new Worker<EmbeddingJobData>(
  EMBEDDING_QUEUE_NAME,
  async (job) => {
    const { profileId } = job.data;

    logger.info(`[Embedding Worker] Job received for profileId: ${profileId}`);

    const [current] = await db
      .update(profiles)
      .set({
        embeddingStatus: "processing",
      })
      .where(
        and(
          eq(profiles.id, profileId),
          or(
            eq(profiles.embeddingStatus, "stale"),
            eq(profiles.embeddingStatus, "processing"),
          ),
        ),
      )
      .returning({ embeddingVersion: profiles.embeddingVersion });

    if (!current) {
      return logger.warn(
        `[Embedding Worker] Skipped ${profileId}- not in stale state`,
      );
    }

    const capturedVerison = current?.embeddingVersion;
    if (capturedVerison === undefined) {
      logger.warn(
        `[Embedding Worker] Skipped ${profileId} - no embedding version captured`,
      );
      return;
    }
    const fullProfile = await repository.getMyProfileById(profileId);
    const corpus = buildProfileCorpus(fullProfile);

    const vector = await generateEmbedding(corpus);

    const result = await db
      .update(profiles)
      .set({
        embeddingStatus: "ready",
        embeddingUpdatedAt: new Date(),
        embeddingVector: vector,
      })
      .where(
        and(
          eq(profiles.id, profileId),
          eq(profiles.embeddingVersion, capturedVerison),
        ),
      )
      .returning({ id: profiles.id });

    if (result.length === 0) {
      logger.warn(
        `[Embedding Worker] Version mismatch for ${profileId} — newer job will handle it`,
      );
      await embeddingQueue.add(
        "generate_embedding",
        { profileId },
        { jobId: `${profileId}-${Date.now()}` },
      );
      return;
    }

    logger.info(`[Embedding Worker] ** Done for profileId: ${profileId}`);
  },
  {
    connection: bullMQConnection,
    concurrency: 1,
    limiter: { max: 1, duration: 25000 },
  },
);

embeddingWorker.on("failed", (job, err) => {
  logger.error(
    { err, profileId: job?.data.profileId },
    `[Embedding Worker] Job failed: ${job?.id}`,
  );

  if (job && job.attemptsMade >= (job.opts.attempts ?? 3)) {
    db.update(profiles)
      .set({
        embeddingStatus: "failed",
      })
      .where(eq(profiles.id, job.data.profileId))
      .catch((err) =>
        logger.error(err, "[Embedding Worker] could not mark status=failed"),
      );
  }
});

embeddingWorker.on("completed", (job) => {
  logger.info(
    `[Embedding Worker]  Job ${job.id} completed for profileId: ${job.data.profileId}`,
  );
});
