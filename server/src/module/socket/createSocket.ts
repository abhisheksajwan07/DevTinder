import { Server as HttpServer } from "node:http";
import {Server} from "socket.io"
import { env } from "../../config/env.js";


export function createSocketServer(httpServer: HttpServer) {
  return new Server(httpServer, {
    cors: {
      origin: env.CLIENT_URL,
      credentials: true,
    },
  });
}
