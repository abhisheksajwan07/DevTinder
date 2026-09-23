import { Send } from "lucide-react";

interface ChatComposerProps {
  input: string;
  setInput: (val: string) => void;
  handleSend: () => void;
}

export default function ChatComposer({
  input,
  setInput,
  handleSend,
}: ChatComposerProps) {
  return (
    <div className="shrink-0 border-t border-[#e9e5df] bg-white px-4 py-3 pb-[calc(0.75rem+env(safe-area-inset-bottom))] lg:px-6 lg:py-4">
      <div className="flex items-end gap-3">
        <div className="flex-1 rounded-2xl border border-[#e2ded6] bg-[#f7f5f2] px-4 py-3 transition focus-within:border-orange-500 focus-within:bg-white focus-within:ring-2 focus-within:ring-orange-500/20">
          <textarea
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter" && !e.shiftKey) {
                e.preventDefault();
                handleSend();
              }
            }}
            placeholder="Type a message..."
            rows={1}
            className="max-h-32 w-full resize-none overflow-y-auto bg-transparent text-sm text-[#242322] outline-none placeholder:text-[#88827c]"
          />
        </div>
        <button
          type="button"
          onClick={handleSend}
          disabled={!input.trim()}
          className="flex size-10 shrink-0 items-center justify-center rounded-2xl bg-[#1a1918] text-white shadow-md transition hover:bg-orange-600 active:scale-95 disabled:opacity-40"
        >
          <Send className="size-4" />
        </button>
      </div>
    </div>
  );
}
