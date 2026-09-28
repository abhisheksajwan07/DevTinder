import { Server } from "socket.io";
import { logger } from "../../config/logger.js";
import { socketAuthMiddleware } from "./socket.middleware.js";
import { registerChatEvents } from "./chat.socket.js";
import { presenceService } from "../chat/presence/presence.dependencies.js";
import { chatRepository } from "../chat/chat.dependencies.js";
import { redis } from "../../config/redis.js";

export function registerSocketHandler(io: Server) {
  // Dedicated Redis subscriber connection for cross-process BullMQ worker events
  const subRedis = redis.duplicate();
  subRedis.subscribe("events:match-created", (err) => {
    if (err) {
      logger.error({ err }, "Failed to subscribe to events:match-created channel");
    } else {
      logger.info("Subscribed to events:match-created Redis channel");
    }
  });

  subRedis.on("message", (channel, message) => {
    if (channel === "events:match-created") {
      try {
        const data = JSON.parse(message) as {
          profileOneId: string;
          profileTwoId: string;
          conversationId: string;
        };

        // Notify both users in their private profile rooms immediately
        io.to(`profile:${data.profileOneId}`).emit("match:created", {
          conversationId: data.conversationId,
          otherProfileId: data.profileTwoId,
        });
        io.to(`profile:${data.profileTwoId}`).emit("match:created", {
          conversationId: data.conversationId,
          otherProfileId: data.profileOneId,
        });

        logger.info(
          { conversationId: data.conversationId },
          "Emitted match:created to counterparties via WebSockets",
        );
      } catch (err) {
        logger.error({ err }, "Error handling events:match-created Pub/Sub message");
      }
    }
  });

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



