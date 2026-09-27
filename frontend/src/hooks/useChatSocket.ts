import { useState, useRef, useEffect, useCallback } from "react";
import { useQueryClient, InfiniteData } from "@tanstack/react-query";
import { socket } from "../services/socket";
import type {
  ChatMessage,
  ConversationListItem,
  PaginatedConversations,
  PaginatedMessages,
} from "../types/chat";

interface UseChatSocketOptions {
  conversationId?: string;
  myProfileId?: string | null;
  inputText: string;
  setInputText: (val: string) => void;
}

export function useChatSocket({
  conversationId,
  myProfileId,
  inputText,
  setInputText,
}: UseChatSocketOptions) {
  const queryClient = useQueryClient();
  const [isOtherUserTyping, setIsOtherUserTyping] = useState(false);

  const otherUserTypingTimeoutRef = useRef<ReturnType<
    typeof setTimeout
  > | null>(null);
  const myTypingTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const isEmittingTypingRef = useRef(false);

  //--1. Room Lifecycle & Socket Event Subscriptions --
  useEffect(() => {
    if (conversationId) {
      // Join conversation room — emit message:read INSIDE the ack callback
      // so we're guaranteed the socket has joined the room before marking read
      socket.emit(
        "conversation:join",
        { conversationId },
        (ack: { success: boolean; message?: string }) => {
          if (!ack?.success) {
            console.warn("Failed to join conversation room:", ack?.message);
            return;
          }
          socket.emit("message:read", { conversationId });
        },
      );

      // reset unread count after attempt to join
      queryClient.setQueryData<InfiniteData<PaginatedConversations>>(
        ["user", "conversations"],
        (old) => {
          if (!old) return old;
          return {
            ...old,
            pages: old.pages.map((page) => ({
              ...page,
              items: page.items.map((c) =>
                c.conversationId === conversationId
                  ? { ...c, unreadCount: 0 }
                  : c,
              ),
            })),
          };
        },
      );
    }

    // Handle new incoming message for the ACTIVE conversation (messages cache)
    const onNewMessage = (newMsg: ChatMessage) => {
      if (newMsg.conversationId === conversationId) {
        queryClient.setQueryData<InfiniteData<PaginatedMessages>>(
          ["chat", "messages", conversationId],
          (old) => {
            if (!old) {
              return {
                pages: [{ messages: [newMsg], nextCursor: null }],
                pageParams: [undefined],
              };
            }

            if (
              old.pages.some((page) =>
                page.messages.some((message) => message.id === newMsg.id),
              )
            ) {
              return old;
            }

            return {
              ...old,
              pages: old.pages.map((page, index) =>
                index === 0
                  ? { ...page, messages: [newMsg, ...page.messages] }
                  : page,
              ),
            };
          },
        );

        // If we received a message from someone else, immediately mark as read
        // (we're already in the room so this is safe)
        if (newMsg.senderProfileId !== myProfileId) {
          socket.emit("message:read", { conversationId });
        }
      }
    };

    // Handle typing start
    const onTypingStart = (data: {
      conversationId: string;
      profileId: string;
    }) => {
      if (
        data.conversationId === conversationId &&
        data.profileId !== myProfileId
      ) {
        setIsOtherUserTyping(true);
        if (otherUserTypingTimeoutRef.current) {
          clearTimeout(otherUserTypingTimeoutRef.current);
        }
        otherUserTypingTimeoutRef.current = setTimeout(() => {
          setIsOtherUserTyping(false);
        }, 3000);
      }
    };

    // Handle typing stop
    const onTypingStop = (data: {
      conversationId: string;
      profileId: string;
    }) => {
      if (
        data.conversationId === conversationId &&
        data.profileId !== myProfileId
      ) {
        setIsOtherUserTyping(false);
        if (otherUserTypingTimeoutRef.current) {
          clearTimeout(otherUserTypingTimeoutRef.current);
        }
      }
    };

    // Handle read receipt
    const onMessageRead = (data: { conversationId: string }) => {
      if (data.conversationId === conversationId) {
        queryClient.setQueryData<InfiniteData<PaginatedMessages>>(
          ["chat", "messages", conversationId],
          (old) => {
            if (!old) return old;
            const now = new Date().toISOString();
            return {
              ...old,
              pages: old.pages.map((page) => ({
                ...page,
                messages: page.messages.map((message) =>
                  message.readAt ? message : { ...message, readAt: now },
                ),
              })),
            };
          },
        );
      }
    };

    socket.on("message:new", onNewMessage);
    socket.on("typing-start", onTypingStart);
    socket.on("stop-typing", onTypingStop);
    socket.on("message:read", onMessageRead);

    return () => {
      if (conversationId) {
        socket.emit("conversation:leave", { conversationId });
      }
      socket.off("message:new", onNewMessage);
      socket.off("typing-start", onTypingStart);
      socket.off("stop-typing", onTypingStop);
      socket.off("message:read", onMessageRead);
      if (otherUserTypingTimeoutRef.current) {
        clearTimeout(otherUserTypingTimeoutRef.current);
      }
    };
  }, [conversationId, myProfileId, queryClient]);

  // -- 2. Send Message Action --
  const handleSendMessage = useCallback(() => {
    const trimmed = inputText.trim();
    if (!trimmed || !conversationId) return;

    if (myTypingTimerRef.current) {
      clearTimeout(myTypingTimerRef.current);
      myTypingTimerRef.current = null;
    }
    if (isEmittingTypingRef.current) {
      socket.emit("typing-stop", { conversationId });
      isEmittingTypingRef.current = false;
    }

    socket.emit(
      "message:send",
      {
        conversationId,
        content: trimmed,
        type: "text",
      },
      (ack: { success: boolean; data?: ChatMessage; message?: string }) => {
        if (!ack?.success) {
          console.error("Failed to send message:", ack?.message);
          return;
        }

        const confirmed = ack.data;
        if (!confirmed) return;

       
        queryClient.setQueryData<InfiniteData<PaginatedMessages>>(
          ["chat", "messages", conversationId],
          (old) => {
            if (!old) return old;
        
            const alreadyExists = old.pages.some((p) =>
              p.messages.some((m) => m.id === confirmed.id),
            );
            if (alreadyExists) return old;
        
            return {
              ...old,
              pages: old.pages.map((page, i) =>
                i === 0
                  ? { ...page, messages: [confirmed, ...page.messages] }
                  : page,
              ),
            };
          },
        );

        
        queryClient.setQueryData<InfiniteData<PaginatedConversations>>(
          ["user", "conversations"],
          (old) => {
            if (!old) return old;

            // Find the target across pages
            let target: ConversationListItem | undefined;
            for (const page of old.pages) {
              target = page.items.find(
                (c) => c.conversationId === conversationId,
              );
              if (target) break;
            }
            if (!target) return old;
      
            if (target.lastMessage?.messageId === confirmed.id) return old;

            const updated: ConversationListItem = {
              ...target,
              lastMessageAt: confirmed.createdAt,
              lastMessage: {
                messageId: confirmed.id,
                senderProfileId: confirmed.senderProfileId,
                type: confirmed.type,
                content: confirmed.content,
                createdAt: confirmed.createdAt,
              },
              unreadCount: 0, 
            };

            
            const newPages = old.pages.map((page, pageIdx) => ({
              ...page,
              items:
                pageIdx === 0
                  ? [
                      updated,
                      ...page.items.filter(
                        (c) => c.conversationId !== conversationId,
                      ),
                    ]
                  : page.items.filter(
                      (c) => c.conversationId !== conversationId,
                    ),
            }));

            return { ...old, pages: newPages };
          },
        );
      },
    );

    setInputText("");
  }, [conversationId, inputText, setInputText, queryClient]);

  // ── 3. Input Change with Typing Debounce ─────────────────────
  const handleInputChange = useCallback(
    (val: string) => {
      setInputText(val);
      if (!conversationId) return;

      if (!isEmittingTypingRef.current) {
        socket.emit("typing-start", { conversationId });
        isEmittingTypingRef.current = true;
      }

      if (myTypingTimerRef.current) {
        clearTimeout(myTypingTimerRef.current);
      }
      myTypingTimerRef.current = setTimeout(() => {
        socket.emit("typing-stop", { conversationId });
        isEmittingTypingRef.current = false;
      }, 1500);
    },
    [conversationId, setInputText],
  );

  return {
    isOtherUserTyping,
    handleSendMessage,
    handleInputChange,
  };
}
