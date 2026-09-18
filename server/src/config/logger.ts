import pino from "pino";
import { env } from "./env.js";

const isDev = env.NODE_ENV === "development" || env.NODE_ENV === "test";
const usePrettyLogs = isDev || process.env.LOG_PRETTY === "true";
const redact = [
  "req.headers.authorization",
  "req.headers.cookie",
  "res.headers.set-cookie",
  "res.headers['set-cookie']",
  "*.accessToken",
  "*.refreshToken",
  "*.csrfToken",
  "*.cookie",
  "*.authorization",
];

export const logger = pino({
  level: process.env.LOG_LEVEL || "info",
  redact,
  ...(usePrettyLogs
    ? {
        transport: {
          target: "pino-pretty",
          options: {
            colorize: true,
            translateTime: "HH:MM:ss",
            ignore: "pid,hostname",
          },
        },
      }
    : {}),
});
