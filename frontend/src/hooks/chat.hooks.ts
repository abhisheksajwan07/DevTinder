import { useInfiniteQuery } from "@tanstack/react-query";
import {
  getConversationMessages,
  getUserConversations,
} from "../services/chat.api";
import type { ChatMessage, ConversationListItem } from "../types/chat";

export const useConversations = () => {
  const query = useInfiniteQuery({
    queryKey: ["user", "conversations"],
    queryFn: ({ pageParam }) =>
      getUserConversations(pageParam as string | undefined),
    initialPageParam: undefined as string | undefined,
    getNextPageParam: (lastPage: any) => {
      if (!lastPage || Array.isArray(lastPage)) return undefined;
      return lastPage.nextCursor ?? undefined;
    },
  });

  const conversations: ConversationListItem[] =
    query.data?.pages.flatMap((p: any) => {
      if (!p) return [];
      if (Array.isArray(p)) return p.filter(Boolean);
      if (Array.isArray(p.items)) return p.items.filter(Boolean);
      return [];
    }) ?? [];

  return { ...query, conversations };
};

export const useConversationMessages = (conversationId?: string) => {
  const query = useInfiniteQuery({
    queryKey: ["chat", "messages", conversationId],
    queryFn: ({ pageParam }) =>
      getConversationMessages(
        conversationId as string,
        pageParam as string | undefined,
      ),
    enabled: !!conversationId,
    initialPageParam: undefined as string | undefined,

    getNextPageParam: (lastPage: any) => {
      if (!lastPage || Array.isArray(lastPage)) return undefined;
      return lastPage.nextCursor ?? undefined;
    },
    staleTime: 0,
    refetchOnMount: "always",
    refetchOnReconnect: true,
  });

  // Flatten all pages. Each page is DESC (newest first).
  // Result is newest-first across all pages — component reverses to display.
  const serverMessages: ChatMessage[] =
    query.data?.pages.flatMap((p: any) => {
      if (!p) return [];
      if (Array.isArray(p)) return p.filter(Boolean);
      if (Array.isArray(p.messages)) return p.messages.filter(Boolean);
      return [];
    }) ?? [];

  return {
    ...query,
    serverMessages,
  };
};
