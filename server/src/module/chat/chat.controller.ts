import { Request, Response } from "express";
import { chatService } from "./chat.dependencies.js";
import { AppError } from "../../utils/AppError.js";
import { sendResponse } from "../../utils/sendResponse.js";


export const getUserConversationsController = async (
  req: Request,
  res: Response,
): Promise<void> => {
  if (!req.user || !req.user.profileId) {
    throw new AppError("Unauthorized", 401);
  }

  const conversations = await chatService.getUserConversations(
    req.user.profileId,
  );
  sendResponse(res, 200, "Conversations fetched successfully", conversations);
};

export const getConversationMessagesController = async (
  req: Request<{ conversationId: string }>,
  res: Response,
): Promise<void> => {
  if (!req.user || !req.user.profileId) {
    throw new AppError("Unauthorized", 401);
  }

  const { conversationId } = req.params;
  const messages = await chatService.getConversationMessage(
    conversationId,
    req.user.profileId,
  );
  sendResponse(res, 200, "Messages fetched successfully", messages);
};

// export const sendMessageController = async (
//   req: Request<{ conversationId: string }, {}, SendMessageDTO>,
//   res: Response,
// ): Promise<void> => {
//   if (!req.user || !req.user.profileId) {
//     throw new AppError("Unauthorized", 401);
//   }

//   const { conversationId } = req.params;
//   const message = await chatService.sendMessage(
//     conversationId,
//     req.user.profileId,
//     req.body,
//   );
//   sendResponse(res, 201, "Message sent successfully", message);
// };
