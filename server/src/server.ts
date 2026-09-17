import { createServer } from "node:http";
import app from "./app.js";
import { env } from "./config/env.js";
import { logger } from "./config/logger.js";
import { createSocketServer } from "./module/socket/createSocket.js";
import { registerSocketHandler } from "./module/socket/socket.js";
import { presenceService } from "./module/chat/presence/presence.dependencies.js";
import { pool } from "./db/drizzle.js";
import { redis } from "./config/redis.js";

const httpServer = createServer(app);

export const io = createSocketServer(httpServer);
console.log("Socket.IO initialized");
registerSocketHandler(io);

async function startServer() {
  // Presence is ephemeral. Clear socket IDs left behind by a crashed or
  // force-stopped dev server; active clients reconnect and register again.
  await presenceService.clearAllPresenceKeys();

  httpServer.listen(env.PORT, () => {
    logger.info(`Server running on port ${env.PORT}`);
  });
}

let isShuttingDown = false;

async function gracefulShutdown(signal: string) {
  if (isShuttingDown) return;
  isShuttingDown = true;
  logger.info({ signal }, "Shutdown started");

  io.close();
  await new Promise<void>((resolve) => {
    httpServer.close(() => resolve());
  });
  await redis.quit();
  await pool.end();

  logger.info("Shutdown complete");
  process.exit(0);
}

process.once("SIGINT", () => void gracefulShutdown("SIGINT"));
process.once("SIGTERM", () => void gracefulShutdown("SIGTERM"));

void startServer();
