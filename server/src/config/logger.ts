import pino from "pino";
import { env } from "./env.js";

const isDev = env.NODE_ENV === "dev";

export const logger = isDev
  ? pino({
      level: process.env.LOG_LEVEL || "info",
      transport: {
        target: "pino-pretty",
        options: {
          colorize: true,
          translateTime: "HH:MM:ss",
          ignore: "pid,hostname",
        },
      },
    })
  : pino({
      level: process.env.LOG_LEVEL || "info",
    });
