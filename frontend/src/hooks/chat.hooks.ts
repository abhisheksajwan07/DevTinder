import { useQuery } from "@tanstack/react-query";
import {
  getConversationMessages,
  getUserConversations,
} from "../services/chat.api";

export const useConversations = () => {
  return useQuery({
    queryKey: ["user", "conversations"],
    queryFn: getUserConversations,
  });
};

export const useConversationMessages = (conversationId?: string | undefined) => {
  return useQuery({
    queryKey: ["chat", "messages", conversationId],
    queryFn: () => getConversationMessages(conversationId as string),
    enabled: !!conversationId,
    // Messages can arrive while this chat is not the active view. Never rely
    // on the global 30-second cache when opening a conversation.
    staleTime: 0,
    refetchOnMount: "always",
    refetchOnReconnect: true,
  });
};
