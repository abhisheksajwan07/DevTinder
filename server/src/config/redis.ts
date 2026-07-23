import { Redis } from "ioredis";
import { env } from "../config/env.js";
import { logger } from "./logger.js";

export const redis = new Redis(env.REDIS_URL);

export const bullMQConnection = {
  url: env.REDIS_URL,
  maxRetriesPerRequest: null,
};

redis.on("connect", () => {
  logger.info("Redis connected");
});

redis.on("ready", () => {
  logger.info("Redis ready");
});

redis.on("reconnecting", () => {
  logger.warn("Redis reconnecting...");
});

redis.on("close", () => {
  logger.warn("Redis connection closed");
});

redis.on("error", (err) => {
  logger.error({ err }, "Redis error");
});