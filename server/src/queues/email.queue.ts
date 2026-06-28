import { Queue } from "bullmq";
import { bullMQConnection } from "../config/redis.js";


export const QUEUE_NAME = "email";

export const emailQueue = new Queue(QUEUE_NAME, {
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
