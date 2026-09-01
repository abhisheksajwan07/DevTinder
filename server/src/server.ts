import { createServer } from "node:http";
import app from "./app.js";
import { env } from "./config/env.js";
import { logger } from "./config/logger.js";
import { createSocketServer } from "./module/socket/createSocket.js";
import { registerSocketHandler } from "./module/socket/socket.js";
import { presenceService } from "./module/chat/presence/presence.dependencies.js";

const httpServer = createServer(app);

export const io = createSocketServer(httpServer);
console.log("Socket.IO initialized");
registerSocketHandler(io);

async function startServer() {
  // Presence is ephemeral. Clear socket IDs left behind by a crashed or
  // force-stopped dev server; active clients reconnect and register again.
  await presenceService.clearAllPresenceKeys();

  httpServer.listen(env.PORT, () => {
    logger.info(`Server running on http://localhost:${env.PORT}`);
  });
}

void startServer();
