import type { Conversation } from "../../mock-data";

interface ConversationItemProps {
  conv: Conversation;
  isActive: boolean;
  onClick: () => void;
}

export default function ConversationItem({
  conv,
  isActive,
  onClick,
}: ConversationItemProps) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`w-full flex items-center gap-3 px-4 py-3.5 text-left transition-colors ${
        isActive
          ? "bg-orange-50 border-r-2 border-orange-500"
          : "hover:bg-[#f7f5f2]"
      }`}
    >
      <div className="relative shrink-0">
        <div
          className="size-10 rounded-2xl grid place-items-center text-white font-bold text-xs shadow-xs"
          style={{ backgroundColor: conv.participant.avatarColor }}
        >
          {conv.participant.avatar}
        </div>
        {conv.participant.isOnline && (
          <span className="absolute -bottom-0.5 -right-0.5 size-2.5 rounded-full border-2 border-white bg-emerald-500" />
        )}
      </div>
      <div className="flex-1 min-w-0">
        <div className="flex items-center justify-between gap-1">
          <p className="text-sm font-semibold text-[#242322] truncate">
            {conv.participant.name}
          </p>
          <span className="text-[10px] font-mono text-[#88827c] shrink-0">
            {conv.lastTimestamp}
          </span>
        </div>
        <p className="text-xs text-[#77736e] truncate mt-0.5">
          {conv.lastMessage}
        </p>
      </div>
      {conv.unreadCount > 0 && (
        <span className="shrink-0 flex size-5 items-center justify-center rounded-full bg-orange-500 font-mono text-[10px] font-bold text-white">
          {conv.unreadCount}
        </span>
      )}
    </button>
  );
}
