import type { ChatMessage } from "../../types/chat";
import { Check, CheckCheck } from "lucide-react";

interface ChatBubbleProps {
  msg: ChatMessage;
  isOwn: boolean;
}

export default function ChatBubble({ msg, isOwn }: ChatBubbleProps) {
  const formatTime = (isoString: string) => {
    try {
      return new Date(isoString).toLocaleTimeString([], {
        hour: "2-digit",
        minute: "2-digit",
      });
    } catch {
      return "";
    }
  };

  return (
    <div
      className={`flex items-end gap-2 ${isOwn ? "justify-end" : "justify-start"}`}
    >
      <div
        className={`group relative max-w-[82%] sm:max-w-[72%] rounded-2xl px-4 py-2.5 text-xs sm:text-sm leading-relaxed shadow-xs transition ${isOwn ? "rounded-br-sm bg-[#1a1918] text-white" : "rounded-bl-sm bg-white border border-[#e9e5df] text-[#242322]"}`}
      >
        <p className="break-words font-normal whitespace-pre-wrap">
          {msg.content}
        </p>
        <div
          className={`mt-1 flex items-center justify-end gap-1 font-mono text-[9px] ${isOwn ? "text-white/60" : "text-[#88827c]"}`}
        >
          <span>{formatTime(msg.createdAt)}</span>
          {isOwn &&
            (msg.readAt ? (
              <CheckCheck className="size-3 text-emerald-400 inline" />
            ) : (
              <Check className="size-3 text-white/50 inline" />
            ))}
        </div>
      </div>
    </div>
  );
}
