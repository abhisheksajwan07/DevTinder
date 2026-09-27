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

  const cursor = typeof req.query.cursor === "string" ? req.query.cursor : undefined;
  const limitRaw = typeof req.query.limit === "string" ? parseInt(req.query.limit, 10) : undefined;
  const limit = limitRaw && !isNaN(limitRaw) ? Math.min(limitRaw, 50) : undefined;

  const result = await chatService.getUserConversations(
    req.user.profileId,
    cursor,
    limit,
  );
  sendResponse(res, 200, "Conversations fetched successfully", result);
};

export const getConversationMessagesController = async (
  req: Request<{ conversationId: string }>,
  res: Response,
): Promise<void> => {
  if (!req.user || !req.user.profileId) {
    throw new AppError("Unauthorized", 401);
  }

  const { conversationId } = req.params;
  const cursor = typeof req.query.cursor === "string" ? req.query.cursor : undefined;

  const result = await chatService.getConversationMessage(
    conversationId,
    req.user.profileId,
    cursor,
  );
  sendResponse(res, 200, "Messages fetched successfully", result);
};
