import { useEffect } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { socket } from "../services/socket";
import type { ChatMessage, ConversationListItem } from "../types/chat";
import { toast } from "../components/ui/use-toast";

export function useChatRealtime(
  myProfileId?: string | null,
  activeConversationId?: string,
) {
  const queryClient = useQueryClient();

  useEffect(() => {
    const onNewMessage = (newMsg: ChatMessage) => {
      queryClient.setQueryData<ConversationListItem[]>(
        ["user", "conversations"],
        (old) => {
          if (!old) return old;
          // convo that received the new message
          const target = old.find(
            (conversation) => conversation.conversationId === newMsg.conversationId,
          );
          if (!target) {
            void queryClient.invalidateQueries({
              queryKey: ["user", "conversations"],
            });
            return old;
          }

          // The recipient can receive the same event from both the
          // conversation room and their private profile room.
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
            unreadCount:
              isOwnMessage || isOpen ? 0 : target.unreadCount + 1,
          };
          // place the new message conversation at the top
          return [
            updated,
            ...old.filter(
              (conversation) =>
                conversation.conversationId !== newMsg.conversationId,
            ),
          ];
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
      // this profileId is user profileId sent from the backend
      queryClient.setQueryData<ConversationListItem[]>(
        ["user", "conversations"],
        (old) =>
          old?.map((conversation) =>
            conversation.otherProfileId === data.profileId
              ? { ...conversation, isOnline: data.isOnline }
              : conversation,
          ),
      );
    };

    const onSocketDisconnect = () => {
      queryClient.setQueryData<ConversationListItem[]>(
        ["user", "conversations"],
        (old) => old?.map((conversation) => ({ ...conversation, isOnline: false })),
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
