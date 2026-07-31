import { Server } from "socket.io";
import { logger } from "../../config/logger.js";
import { socketAuthMiddleware } from "./socket.middleware.js";
import { registerChatEvents } from "./chat.socket.js";
import { presenceService } from "../chat/presence/presence.dependencies.js";
import { chatRepository } from "../chat/chat.dependencies.js";

export function registerSocketHandler(io: Server) {
  io.use(socketAuthMiddleware);

  io.on("connection", async (socket) => {
    logger.info(`Client connected:${socket.id}`);
    const profileId = socket.data.profileId as string;

    // Join user to their private profile room
    await socket.join(`profile:${profileId}`);

    try {
      // Connect to presence tracking
      const status = await presenceService.connect(profileId, socket.id);
      if (status.isOnline) {
        // User transitioned from offline to online. Notify counterparties
        const counterparties =
          await chatRepository.getConversationMembersProfileIds(profileId);
        for (const targetId of counterparties) {
          io.to(`profile:${targetId}`).emit("presence:update", {
            profileId,
            isOnline: true,
          });
        }
      }
    } catch (err) {
      logger.error({ err, profileId }, "Error in presence connect handler");
    }

    registerChatEvents(io, socket);

    socket.on("disconnect", async () => {
      logger.info(`Client disconnected:${socket.id}`);
      try {
        // Disconnect from presence tracking
        const status = await presenceService.disConnect(profileId, socket.id);
        if (!status.isOnline) {
          // User transitioned from online to offline. Notify counterparties
          const counterparties =
            await chatRepository.getConversationMembersProfileIds(profileId);
          for (const targetId of counterparties) {
            io.to(`profile:${targetId}`).emit("presence:update", {
              profileId,
              isOnline: false,
            });
          }
        }
      } catch (err) {
        logger.error({ err, profileId }, "Error in presence disconnect handler");
      }
    });
  });
}



