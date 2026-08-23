import type { Message } from "../../mock-data";

interface ChatBubbleProps {
  msg: Message;
  isOwn: boolean;
}

export default function ChatBubble({ msg, isOwn }: ChatBubbleProps) {
  return (
    <div className={`flex ${isOwn ? "justify-end" : "justify-start"}`}>
      <div
        className={`max-w-[78%] rounded-2xl px-4 py-2.5 text-sm leading-relaxed ${
          isOwn
            ? "rounded-br-md bg-[#1a1918] text-white"
            : "rounded-bl-md bg-white border border-[#e9e5df] text-[#242322]"
        }`}
      >
        <p>{msg.text}</p>
        <p
          className={`mt-1 font-mono text-[10px] ${
            isOwn ? "text-white/50 text-right" : "text-[#88827c]"
          }`}
        >
          {msg.timestamp}
          {isOwn && msg.read && (
            <span className="ml-1 text-emerald-400">✓✓</span>
          )}
        </p>
      </div>
    </div>
  );
}
