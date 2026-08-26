import type { ConversationListItem } from "../../types/chat";

interface ConversationItemProps {
  conv: ConversationListItem;
  isActive: boolean;
  onClick: () => void;
}

export default function ConversationItem({
  conv,
  isActive,
  onClick,
}: ConversationItemProps) {
  const formatTime = (isoString?: string | null) => {
    if (!isoString) return "";
    return new Date(isoString).toLocaleTimeString([], {
      hour: "2-digit",
      minute: "2-digit",
    });
  };
  const fullName = `${conv.firstName} ${conv.lastName}`.trim() || conv.username;
  const initial = (
    conv.firstName?.[0] ||
    conv.username?.[0] ||
    "U"
  ).toUpperCase();

  return (
    <button
      type="button"
      onClick={onClick}
      className={`w-full flex items-center gap-3 px-4 py-3.5 text-left transition-all ${isActive ? "bg-orange-50/80 border-r-3 border-orange-500 shadow-xs" : "hover:bg-[#f7f5f2]/80"}`}
    >
      <div className="relative shrink-0">
        {conv.avatarUrl ? (
          <img
            src={conv.avatarUrl}
            alt={fullName}
            className="size-11 rounded-2xl object-cover border border-[#e9e5df] shadow-xs"
          />
        ) : (
          <div className="size-11 rounded-2xl grid place-items-center bg-gradient-to-br from-orange-400 to-amber-500 text-white font-bold text-xs shadow-xs">
            {initial}
          </div>
        )}
        {conv.isOnline && (
          <span className="absolute -bottom-0.5 -right-0.5 size-3 rounded-full border-2 border-white bg-emerald-500" />
        )}
      </div>
      <div className="flex-1 min-w-0">
        <div className="flex items-center justify-between gap-1">
          <p className="text-xs font-bold truncate text-[#332f2c]">
            {fullName}
          </p>
          <span className="text-[10px] font-mono text-[#88827c] shrink-0">
            {formatTime(conv.lastMessage?.createdAt || conv.lastMessageAt)}
          </span>
        </div>
        <div className="flex items-center justify-between gap-2 mt-0.5">
          <p
            className={`text-[11px] truncate ${conv.unreadCount > 0 ? "font-semibold text-[#242322]" : "text-[#77736e]"}`}
          >
            {conv.lastMessage?.content || "No messages yet"}
          </p>
          {conv.unreadCount > 0 && (
            <span className="shrink-0 flex size-4.5 items-center justify-center rounded-full bg-orange-500 font-mono text-[9px] font-bold text-white shadow-xs">
              {conv.unreadCount}
            </span>
          )}
        </div>
      </div>
    </button>
  );
}
