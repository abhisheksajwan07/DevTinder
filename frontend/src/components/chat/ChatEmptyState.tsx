import { MessageSquare, Sparkles } from "lucide-react";

export default function ChatEmptyState() {
  return (
    <div className="hidden lg:flex flex-1 flex-col items-center justify-center bg-[#f7f5f2] p-8 text-center">
      <div className="relative mb-4 flex size-20 items-center justify-center rounded-3xl border border-[#e9e5df] bg-white shadow-xs">
        <MessageSquare className="size-9 text-orange-500" />
        <div className="absolute -bottom-1 -right-1 flex size-6 items-center justify-center rounded-full bg-orange-500 text-white shadow-sm">
          <Sparkles className="size-3.5" />
        </div>
      </div>
      <h2 className="text-base font-bold text-[#242322]">
        Select a conversation
      </h2>
      <p className="max-w-xs text-xs text-[#77736e] mt-1.5 leading-relaxed">
        Choose a developer from your messages list on the left to start messaging.
      </p>
    </div>
  );
}
