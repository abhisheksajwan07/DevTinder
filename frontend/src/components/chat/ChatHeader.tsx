import { ArrowLeft, User } from "lucide-react";
import type { ConversationListItem } from "../../types/chat";

interface ChatHeaderProps {
  conversation: ConversationListItem;
  showProfilePanel: boolean;
  onBack: () => void;
  onToggleProfile: () => void;
}

export default function ChatHeader({
  conversation,
  showProfilePanel,
  onBack,
  onToggleProfile,
}: ChatHeaderProps) {
  const fullName =
    `${conversation.firstName} ${conversation.lastName}`.trim() ||
    conversation.username;
  const initial = (
    conversation.firstName?.[0] || conversation.username[0]
  ).toUpperCase();

  return (
    <header className="flex items-center justify-between px-4 lg:px-6 py-3.5 border-b border-[#e9e5df] bg-white shrink-0 shadow-xs z-10">
      <div className="flex items-center gap-3 min-w-0">
        {/* Mobile Back Button */}
        <button
          type="button"
          onClick={onBack}
          aria-label="Back to conversations"
          className="lg:hidden flex items-center justify-center rounded-xl border border-[#e9e5df] p-2 text-[#55504b] hover:bg-[#f7f5f2] transition"
        >
          <ArrowLeft className="size-4" />
        </button>

        {/* Participant Avatar */}
        <div className="relative shrink-0">
          {conversation.avatarUrl ? (
            <img
              src={conversation.avatarUrl}
              alt={conversation.username}
              className="size-10 rounded-2xl object-cover border border-[#e9e5df] shadow-xs"
            />
          ) : (
            <div className="size-10 rounded-2xl grid place-items-center bg-gradient-to-br from-orange-400 to-amber-500 text-white font-bold text-xs shadow-xs">
              {initial}
            </div>
          )}

          {conversation.isOnline && (
            <span className="absolute -bottom-0.5 -right-0.5 size-2.5 rounded-full border-2 border-white bg-emerald-500" />
          )}
        </div>

        {/* Participant Info */}
        <div className="min-w-0">
          <div className="flex items-center gap-2">
            <h2 className="text-sm font-bold text-[#242322] truncate">
              {fullName}
            </h2>
          </div>
          <p className="font-mono text-[11px] text-[#77736e] truncate flex items-center gap-1.5">
            {conversation.isOnline ? (
              <span className="text-emerald-600 font-semibold">Online</span>
            ) : (
              "Offline"
            )}
            <span>·</span>
            <span>@{conversation.username}</span>
          </p>
        </div>
      </div>

      {/* Header Action Buttons */}
      <div className="flex items-center gap-1.5">
        <button
          type="button"
          onClick={onToggleProfile}
          aria-label="Toggle Profile Panel"
          className={`flex size-9 items-center justify-center rounded-xl border transition ${
            showProfilePanel
              ? "border-orange-500 bg-orange-50 text-orange-600"
              : "border-[#e9e5df] text-[#55504b] hover:bg-[#f7f5f2] hover:text-[#242322]"
          }`}
        >
          <User className="size-4" />
        </button>
      </div>
    </header>
  );
}
