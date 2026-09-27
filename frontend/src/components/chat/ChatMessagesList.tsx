import { forwardRef, useEffect, useRef, useCallback } from "react";
import { Loader2, Sparkles } from "lucide-react";
import ChatBubble from "./ChatBubble";
import type { ChatMessage, ConversationListItem } from "../../types/chat";

interface ChatMessagesListProps {
  messages: ChatMessage[];
  isLoading: boolean;
  activeConversation: ConversationListItem;
  myProfileId?: string | null;
  isOtherUserTyping: boolean;
  onLoadOlder: () => void;
  hasOlderMessages: boolean;
  isLoadingOlder: boolean;
}

const ChatMessagesList = forwardRef<HTMLDivElement, ChatMessagesListProps>(
  (
    {
      messages,
      isLoading,
      activeConversation,
      myProfileId,
      isOtherUserTyping,
      onLoadOlder,
      hasOlderMessages,
      isLoadingOlder,
    },
    ref,
  ) => {
    const participantName =
      activeConversation.firstName || activeConversation.username;
    const initial = (
      activeConversation.firstName?.[0] || activeConversation.username[0]
    ).toUpperCase();

    const scrollContainerRef = useRef<HTMLDivElement>(null);
    const topSentinelRef = useRef<HTMLDivElement>(null);

   
    const prevScrollHeightRef = useRef<number>(0);

   
    useEffect(() => {
      if (isLoadingOlder) {
        prevScrollHeightRef.current =
          scrollContainerRef.current?.scrollHeight ?? 0;
      }
    }, [isLoadingOlder]);

  
    useEffect(() => {
      if (!isLoadingOlder && prevScrollHeightRef.current > 0) {
        const container = scrollContainerRef.current;
        if (container) {
          const newScrollHeight = container.scrollHeight;
          container.scrollTop += newScrollHeight - prevScrollHeightRef.current;
        }
        prevScrollHeightRef.current = 0;
      }
    }, [isLoadingOlder, messages.length]);

  
    const handleLoadOlder = useCallback(() => {
      if (hasOlderMessages && !isLoadingOlder) onLoadOlder();
    }, [hasOlderMessages, isLoadingOlder, onLoadOlder]);

    useEffect(() => {
      const sentinel = topSentinelRef.current;
      if (!sentinel) return;
      const observer = new IntersectionObserver(
        (entries) => {
          if (entries[0]?.isIntersecting) handleLoadOlder();
        },
        { threshold: 0.1 },
      );
      observer.observe(sentinel);
      return () => observer.disconnect();
    }, [handleLoadOlder]);

    return (
      <div
        ref={scrollContainerRef}
        className="flex-1 w-full overflow-y-auto overflow-x-hidden px-4 lg:px-6 py-5 space-y-4"
      >
        {/* ── Top sentinel: fires when user scrolls to top ── */}
        <div ref={topSentinelRef} className="h-1" />

        {/* Loading older messages spinner */}
        {isLoadingOlder && (
          <div className="flex justify-center py-2">
            <Loader2 className="size-4 animate-spin text-[#88827c]" />
          </div>
        )}

        {/* Match Banner Announcement */}
        {!hasOlderMessages && (
          <div className="mx-auto max-w-sm rounded-2xl border border-orange-200/80 bg-linear-to-br from-orange-50 to-amber-50/50 p-3.5 text-center shadow-xs">
            <div className="flex flex-wrap items-center justify-center gap-1 text-orange-600 font-bold text-xs mb-1">
              <Sparkles className="size-3.5" />
              <span className="min-w-0 break-words">
                Connected with {participantName}
              </span>
            </div>
            <p className="text-[11px] text-[#77736e]">
              Say hello and start collaborating on projects!
            </p>
          </div>
        )}

        {/* Date Divider */}
        <div className="flex items-center gap-3 my-4">
          <div className="h-px flex-1 bg-[#e9e5df]" />
          <span className="font-mono text-[10px] font-semibold uppercase tracking-wider text-[#88827c] bg-[#f7f5f2] px-2">
            Conversation
          </span>
          <div className="h-px flex-1 bg-[#e9e5df]" />
        </div>

        {/* Messages Stream */}
        {isLoading || !myProfileId ? (
          <div className="py-8 text-center text-xs text-[#88827c]">
            {!myProfileId ? "Loading your profile..." : "Loading messages..."}
          </div>
        ) : messages.length > 0 ? (
          // Messages are DESC (newest first) — reverse to render oldest at top
          [...messages]
            .filter((m): m is ChatMessage => Boolean(m && m.id))
            .reverse()
            .map((msg) => (
              <ChatBubble
                key={msg.id}
                msg={msg}
                isOwn={Boolean(
                  msg.senderProfileId &&
                  myProfileId &&
                  msg.senderProfileId.trim().toLowerCase() ===
                  myProfileId.trim().toLowerCase(),
                )}
              />
            ))
        ) : (
          <div className="py-12 text-center text-xs text-[#88827c]">
            No messages yet. Send a message to start chatting!
          </div>
        )}

        {/* Other User Typing Indicator */}
        {isOtherUserTyping && (
          <div className="flex items-end gap-2">
            <div className="size-7 rounded-xl grid place-items-center bg-orange-400 text-white font-bold text-[10px] shrink-0">
              {initial}
            </div>
            <div className="flex items-center gap-1 rounded-2xl rounded-bl-md bg-white border border-[#e9e5df] px-3.5 py-2.5 shadow-xs">
              <span className="size-1.5 rounded-full bg-orange-400 animate-bounce [animation-delay:0ms]" />
              <span className="size-1.5 rounded-full bg-orange-400 animate-bounce [animation-delay:150ms]" />
              <span className="size-1.5 rounded-full bg-orange-400 animate-bounce [animation-delay:300ms]" />
            </div>
          </div>
        )}

        {/* Bottom anchor — ChatPage scrolls here on new message */}
        <div ref={ref} />
      </div>
    );
  },
);

ChatMessagesList.displayName = "ChatMessagesList";
export default ChatMessagesList;
