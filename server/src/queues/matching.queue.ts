import { Queue } from "bullmq";
import { bullMQConnection } from "../config/redis.js";

export const MATCH_QUEUE_NAME = "matching";

export const matchingQueue = new Queue(MATCH_QUEUE_NAME, {
  connection:  bullMQConnection,
  defaultJobOptions: {
    attempts: 3,
    backoff: {
      type: "exponential",
      delay: 2000,
    },
    removeOnComplete: 50,
    removeOnFail: 100,
  },
});
