import { logger } from "../../../config/logger.js";
import { pool } from "../../drizzle.js";
import { seedFeedCandidates } from "./feed-candidates.seed.js";
import { seedProfileActions } from "./profile-actions.seed.js";
import { seedLoadTestUsers } from "./load-test-users.seed.js";

export async function seedLoadTestAll() {
  await seedLoadTestUsers(50);
  await seedFeedCandidates(5000);
  await seedProfileActions();
}

const SEED_TASKS: Record<string, () => Promise<unknown>> = {
  users: () => seedLoadTestUsers(50),
  feed: () => seedFeedCandidates(5000),
  actions: seedProfileActions,
};

const run = async () => {
  const mode = process.argv[2];
  const task = (mode && SEED_TASKS[mode]) ? SEED_TASKS[mode] : seedLoadTestAll;

  try {
    await task();
  } catch (error) {
    logger.error(error, "Load-test seeding failed:");
    process.exitCode = 1;
  } finally {
    await pool.end();
  }
};

run();
