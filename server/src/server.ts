import { createServer } from "node:http";
import app from "./app.js";
import { env } from "./config/env.js";
import { logger } from "./config/logger.js";
import { createSocketServer } from "./module/socket/createSocket.js";
import { registerSocketHandler } from "./module/socket/socket.js";

const httpServer = createServer(app);

export const io = createSocketServer(httpServer);
console.log("Socket.IO initialized");
registerSocketHandler(io);

httpServer.listen(env.PORT, () => {
  logger.info(`Server running on http://localhost:${env.PORT}`);
});
