import { RedisStore } from "rate-limit-redis";
import { redis } from "../config/redis.js";

export const createRedisStore = (prefix: string) =>
  new RedisStore({
    sendCommand: async (...args: string[]) => {
      const [command, ...rest] = args;
      return (await redis.call(command!, ...rest)) as any;
    },
    prefix,
  });
