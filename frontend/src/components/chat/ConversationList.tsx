import { Search, MessageSquare, Loader2 } from "lucide-react";
import { useEffect, useRef } from "react";
import ConversationItem from "./ConversationItem";
import type { ConversationListItem } from "../../types/chat";

interface ConversationListProps {
  conversations: ConversationListItem[];
  isLoading: boolean;
  activeConversationId?: string;
  searchQuery: string;
  onSearchChange: (query: string) => void;
  onSelectConversation: (id: string) => void;
  isMobileChatOpen: boolean;
  onLoadMore: () => void;
  hasMore: boolean;
  isLoadingMore: boolean;
}

export default function ConversationList({
  conversations,
  isLoading,
  activeConversationId,
  searchQuery,
  onSearchChange,
  onSelectConversation,
  isMobileChatOpen,
  onLoadMore,
  hasMore,
  isLoadingMore,
}: ConversationListProps) {
  const sentinelRef = useRef<HTMLDivElement>(null);

  // Trigger next page fetch when the sentinel scrolls into view
  useEffect(() => {
    const sentinel = sentinelRef.current;
    if (!sentinel) return;
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0]?.isIntersecting && hasMore && !isLoadingMore) {
          onLoadMore();
        }
      },
      { threshold: 0.1 },
    );
    observer.observe(sentinel);
    return () => observer.disconnect();
  }, [hasMore, isLoadingMore, onLoadMore]);

  return (
    <aside
      className={`
        ${isMobileChatOpen ? "hidden" : "flex"} 
        lg:flex flex-col w-full lg:w-[260px] xl:w-[300px] shrink-0 bg-white border-r border-[#e9e5df] transition-all
      `}
    >
      {/* Header & Search */}
      <div className="p-4 border-b border-[#f0ece6] space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <h1 className="text-lg font-bold text-[#242322]">Messages</h1>
            {conversations.length > 0 && (
              <span className="rounded-full bg-orange-100 px-2 py-0.5 font-mono text-[10px] font-bold text-orange-600">
                {conversations.length}
              </span>
            )}
          </div>
        </div>

        <div className="relative">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 size-4 text-[#88827c]" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
            placeholder="Search conversations..."
            className="w-full rounded-2xl border border-[#e2ded6] bg-[#f7f5f2] pl-10 pr-4 py-2.5 text-xs font-medium text-[#242322] outline-none transition focus:border-orange-500 focus:bg-white focus:ring-2 focus:ring-orange-500/20 placeholder:text-[#88827c]"
          />
        </div>
      </div>

      {/* Conversations Scroll Area */}
      <div className="flex-1 overflow-y-auto divide-y divide-[#f0ece6]">
        {isLoading ? (
          <div className="p-8 text-center text-xs text-[#88827c]">
            Loading conversations...
          </div>
        ) : conversations.length > 0 ? (
          <>
            {conversations.map((conv) => (
              <ConversationItem
                key={conv.conversationId}
                conv={conv}
                isActive={conv.conversationId === activeConversationId}
                onClick={() => onSelectConversation(conv.conversationId)}
              />
            ))}

            {/* Scroll sentinel — triggers onLoadMore when visible */}
            <div ref={sentinelRef} className="h-1" />

            {isLoadingMore && (
              <div className="flex items-center justify-center py-3">
                <Loader2 className="size-4 animate-spin text-[#88827c]" />
              </div>
            )}
          </>
        ) : (
          <div className="flex flex-col items-center justify-center p-8 text-center text-[#88827c]">
            <MessageSquare className="size-8 text-[#ccc6be] mb-2" />
            <p className="text-xs font-semibold text-[#55504b]">
              No conversations yet
            </p>
            <p className="text-[11px] text-[#88827c] mt-0.5">
              {searchQuery ? "Try a different search" : "Match with developers to start chatting"}
            </p>
          </div>
        )}
      </div>
    </aside>
  );
}
