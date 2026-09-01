import { ChatMessage, ConversationListItem } from "../types/chat";
import { api } from "./api";

// -- 1. Fetch Conversations List --
export const getUserConversations = async (): Promise<ConversationListItem[]> => {
  const response = await api.get("/chat");
  return response.data.data;
};

// -- 2. Fetch Messages for Conversation --
export const getConversationMessages = async (
  conversationId: string,
): Promise<ChatMessage[]> => {
  const response = await api.get(`/chat/${conversationId}/messages`);
  return response.data.data;
};
