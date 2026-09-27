import { ChatMessage, PaginatedConversations, PaginatedMessages } from "../types/chat";
import { api } from "./api";

// -- 1. Fetch Conversations List (cursor-paginated) --
export const getUserConversations = async (
  cursor?: string,
): Promise<PaginatedConversations> => {
  const params = cursor ? { cursor } : {};
  const response = await api.get("/chat", { params });
  return response.data.data;
};

// -- 2. Fetch Messages for Conversation (cursor-paginated, newest first) --
//    cursor = base64 token pointing to the oldest message already loaded.
//    Pass it to load messages older than what you already have.
export const getConversationMessages = async (
  conversationId: string,
  cursor?: string,
): Promise<PaginatedMessages> => {
  const params = cursor ? { cursor } : {};
  const response = await api.get(`/chat/${conversationId}/messages`, { params });
  return response.data.data;
};
