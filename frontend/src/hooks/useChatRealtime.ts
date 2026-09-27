import { useEffect } from "react";
import { useQueryClient, InfiniteData } from "@tanstack/react-query";
import { socket } from "../services/socket";
import type {
  ChatMessage,
  ConversationListItem,
  PaginatedConversations,
} from "../types/chat";
import { toast } from "../components/ui/use-toast";

export function useChatRealtime(
  myProfileId?: string | null,
  activeConversationId?: string,
) {
  const queryClient = useQueryClient();

  useEffect(() => {
    const onNewMessage = (newMsg: ChatMessage) => {
      queryClient.setQueryData<InfiniteData<PaginatedConversations>>(
        ["user", "conversations"],
        (old) => {
          if (!old) return old;

          let target: ConversationListItem | undefined;
          for (const page of old.pages) {
            target = page.items.find(
              (c) => c.conversationId === newMsg.conversationId,
            );
            if (target) break;
          }

          if (!target) {
            void queryClient.invalidateQueries({
              queryKey: ["user", "conversations"],
            });
            return old;
          }

          if (target.lastMessage?.messageId === newMsg.id) return old;

          const isOwnMessage = newMsg.senderProfileId === myProfileId;
          const isOpen = newMsg.conversationId === activeConversationId;

          if (!isOwnMessage && !isOpen) {
            toast({
              title: `New message from ${target.firstName}`,
              description: newMsg.content,
            });
          }

          const updated: ConversationListItem = {
            ...target,
            lastMessageAt: newMsg.createdAt,
            lastMessage: {
              messageId: newMsg.id,
              senderProfileId: newMsg.senderProfileId,
              type: newMsg.type,
              content: newMsg.content,
              createdAt: newMsg.createdAt,
            },
            unreadCount: isOwnMessage || isOpen ? 0 : target.unreadCount + 1,
          };

          // Rebuild pages: move the updated conversation to the top of page 0,
          // removing it from wherever it currently lives.
          const newPages = old.pages.map((page, pageIdx) => ({
            ...page,
            items: page.items.filter(
              (c) => c.conversationId !== newMsg.conversationId,
            ),
            ...(pageIdx === 0
              ? {
                  items: [
                    updated,
                    ...page.items.filter(
                      (c) => c.conversationId !== newMsg.conversationId,
                    ),
                  ],
                }
              : {}),
          }));

          return { ...old, pages: newPages };
        },
      );
    };
    // this updates other user presence in your conversation list

    // this code will run when the other user is loggedIn
    // when u logged in , only the backend emit is done
    // this code code is for listening that emitso this for other users
    const onPresenceUpdate = (data: {
      profileId: string;
      isOnline: boolean;
    }) => {
      queryClient.setQueryData<InfiniteData<PaginatedConversations>>(
        ["user", "conversations"],
        (old) => {
          if (!old) return old;
          return {
            ...old,
            pages: old.pages.map((page) => ({
              ...page,
              items: page.items.map((c) =>
                c.otherProfileId === data.profileId
                  ? { ...c, isOnline: data.isOnline }
                  : c,
              ),
            })),
          };
        },
      );
    };

    const onSocketDisconnect = () => {
      queryClient.setQueryData<InfiniteData<PaginatedConversations>>(
        ["user", "conversations"],
        (old) => {
          if (!old) return old;
          return {
            ...old,
            pages: old.pages.map((page) => ({
              ...page,
              items: page.items.map((c) => ({ ...c, isOnline: false })),
            })),
          };
        },
      );
    };

    const onSocketConnect = () => {
      void queryClient.invalidateQueries({
        queryKey: ["user", "conversations"],
      });
    };

    socket.on("message:new", onNewMessage);
    socket.on("presence:update", onPresenceUpdate);
    socket.on("disconnect", onSocketDisconnect);
    socket.on("connect", onSocketConnect);
    return () => {
      socket.off("message:new", onNewMessage);
      socket.off("presence:update", onPresenceUpdate);
      socket.off("disconnect", onSocketDisconnect);
      socket.off("connect", onSocketConnect);
    };
  }, [activeConversationId, myProfileId, queryClient]);
}
