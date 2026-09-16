import "./workers/worker.email.js";
import "./workers/worker.embedding.js";
import "./workers/worker.match.js";
import "./workers/worker.github.js";

import { pool } from "./db/drizzle.js";
import { redis } from "./config/redis.js";
import { emailWorker } from "./workers/worker.email.js";
import { embeddingWorker } from "./workers/worker.embedding.js";
import { matchingWorker } from "./workers/worker.match.js";
import { githubSyncWorker } from "./workers/worker.github.js";
import { logger } from "./config/logger.js";

let isShuttingDown = false;

async function gracefulShutdown(signal: string) {
  if (isShuttingDown) return;
  isShuttingDown = true;
  logger.info({ signal }, "Worker shutdown started");

  await Promise.all([
    emailWorker.close(),
    embeddingWorker.close(),
    matchingWorker.close(),
    githubSyncWorker.close(),
  ]);
  await redis.quit();
  await pool.end();

  logger.info("Worker shutdown complete");
  process.exit(0);
}

process.once("SIGINT", () => void gracefulShutdown("SIGINT"));
process.once("SIGTERM", () => void gracefulShutdown("SIGTERM"));
