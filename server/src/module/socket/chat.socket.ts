import { Socket } from "socket.io";
import { Server } from "socket.io";
import {
  conversationIdParamSchema,
  sendMessageSocketSchema,
} from "../chat/chat.validator.js";
import { chatService } from "../chat/chat.dependencies.js";
import { chatRepository } from "../chat/chat.dependencies.js";
import { presenceService } from "../chat/presence/presence.dependencies.js";
import { emailQueue } from "../../queues/email.queue.js";
import { notifyOfflineRecipient } from "./notify-offline.js";
import { logger } from "../../config/logger.js";
import { AppError } from "../../utils/AppError.js";

export function registerChatEvents(io: Server, socket: Socket) {
  socket.on("conversation:join", async (payload, ack) => {
    try {
      const result = conversationIdParamSchema.safeParse(payload);

      if (!result.success) {
        return ack({
          success: false,
          message: result.error.issues[0]?.message,
        });
      }

      await chatService.joinConversation(
        result.data.conversationId,
        socket.data.profileId,
      );

      socket.join(result.data.conversationId);

      ack({
        success: true,
        message: "Joined conversation successfully",
      });
    } catch (err) {
      if (err instanceof AppError) {
        return ack({
          success: false,
          code: err.code,
          message: err.message,
        });
      }
      ack({
        success: false,
        message: "Internal server error",
      });
    }
  });

  socket.on("message:send", async (payload, ack) => {
    try {
      const result = sendMessageSocketSchema.safeParse(payload);

      if (!result.success) {
        return ack({
          success: false,
          message: result.error.issues[0]?.message,
        });
      }

      if (!socket.rooms.has(result.data.conversationId)) {
        return ack?.({
          success: false,
          message: "Join the conversation first.",
        });
      }

      const message = await chatService.sendMessage(
        result.data.conversationId,
        socket.data.profileId,
        {
          content: result.data.content,
          type: result.data.type,
        },
      );

      // const sockets = await io.in(result.data.conversationId).fetchSockets()

      // console.log(
      //   "ROOM SOCKETS:",
      //   sockets.map((s) => ({
      //     id: s.id,
      //     rooms: [...s.rooms],
      //   })),
      // );

      // console.log(
      //   "ADAPTER ROOMS:",
      //   [...io.sockets.adapter.rooms.entries()].map(([room, ids]) => ({
      //     room,
      //     sockets: [...ids],
      //   })),
      // );

      io.to(result.data.conversationId).emit("message:new", message);

      // Users who are not currently inside the conversation room still need
      // the event so their global conversation list can update its unread count.
      const participantProfileIds =
        await chatRepository.getConversationParticipantProfileIds(
          result.data.conversationId,
        );
      // Only notify the recipient's profile room.
      // The sender already has the message via the conversation room emit above
      // and the ack payload — no need to double-emit to their profile room.
      participantProfileIds
        .filter((profileId) => profileId !== socket.data.profileId)
        .forEach((profileId) => {
          io.to(`profile:${profileId}`).emit("message:new", message);
        });

      // console.log("EMIT DONE");

      
      // notify recipient by email, if offline
      // fire-and-forget, never block socket ack
      const recipientProfileId = participantProfileIds.find(
        (id) => id !== socket.data.profileId,
      );
      if (recipientProfileId) {
        notifyOfflineRecipient(
          recipientProfileId,
          chatRepository,
          presenceService,
          emailQueue,
        ).catch((err) =>
          logger.error({ err }, "[Chat] Failed to send offline notification"),
        );
      }

      return ack({
        success: true,
        data: message,
      });
    } catch (error) {
      if (error instanceof AppError) {
        return ack({
          success: false,
          code: error.code,
          message: error.message,
        });
      }

      return ack({
        success: false,
        message: "Internal server error",
      });
    }
  });

  socket.on("conversation:leave", (payload, ack) => {
    const result = conversationIdParamSchema.safeParse(payload);
    if (!result.success) {
      return ack?.({
        success: false,
        message: result.error.issues[0]?.message,
      });
    }

    socket.leave(result.data.conversationId);
    ack?.({
      success: true,
    });
  });

  socket.on("typing-start", (payload, ack) => {
    const result = conversationIdParamSchema.safeParse(payload);
    if (!result.success) {
      return ack?.({
        success: false,
        message: result.error.issues[0]?.message,
      });
    }

    const { conversationId } = result.data;
    if (!socket.rooms.has(conversationId)) {
      return ack?.({
        success: false,
        message: "Join the conversation first.",
      });
    }

    const { profileId } = socket.data;
    socket.to(conversationId).emit("typing-start", {
      conversationId,
      profileId,
    });
    ack?.({ success: true });
  });

  socket.on("typing-stop", (payload, ack) => {
    const result = conversationIdParamSchema.safeParse(payload);
    if (!result.success) {
      return ack?.({
        success: false,
        message: result.error.issues[0]?.message,
      });
    }

    const { conversationId } = result.data;
    if (!socket.rooms.has(conversationId)) {
      return ack?.({
        success: false,
        message: "Join the conversation first.",
      });
    }
    const { profileId } = socket.data;
    socket.to(conversationId).emit("stop-typing", {
      conversationId,
      profileId,
    });
    ack?.({
      success: true,
    });
  });

  socket.on("message:read", async (payload, ack) => {
    const { profileId } = socket.data;
    const result = conversationIdParamSchema.safeParse(payload);
    if (!result.success) {
      return ack?.({
        success: false,
        message: result.error.issues[0]?.message,
      });
    }

    const { conversationId } = result.data;
    if (!socket.rooms.has(conversationId)) {
      return ack?.({
        success: false,
        message: "Join the conversation first.",
      });
    }

    try {
      const markAsRead = await chatService.markConversationAsRead(
        conversationId,
        profileId,
      );
      if (markAsRead > 0) {
        socket.to(conversationId).emit("message:read", {
          conversationId,
        });
      }
      ack?.({
        success: true,
      });
    } catch (err) {
      ack?.({
        success: false,
        message: "Failed to mark messages as read",
      });
    }
  });
}
