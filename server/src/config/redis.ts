import { Redis } from "ioredis";
import { env } from "../config/env.js";
import { logger } from "./logger.js";

export const redis = new Redis(env.REDIS_URL);

redis.on("connect", () => {
  logger.info("Redis Connected successfully");
});

redis.on("error", (err) => {
  logger.error({ err }, "Redis connection error");
});
