import type { DevProfile } from "../../app/mock-data";
import { Sparkles, MessageCircle } from "lucide-react";

interface MatchModalProps {
  profile: DevProfile;
  onClose: () => void;
  onChat: () => void;
}

export default function MatchModal({ profile, onClose, onChat }: MatchModalProps) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm">
      <div className="w-full max-w-sm rounded-[28px] border border-[#e9e5df] bg-white shadow-2xl p-8 text-center animate-fade-in">
        <div className="flex justify-center -space-x-3 mb-5">
          <div
            className="size-16 rounded-2xl grid place-items-center text-white font-bold text-lg border-2 border-white shadow-sm"
            style={{ backgroundColor: "#ee7100" }}
          >
            A
          </div>
          <div
            className="size-16 rounded-2xl grid place-items-center text-white font-bold text-lg border-2 border-white shadow-sm"
            style={{ backgroundColor: profile.avatarColor }}
          >
            {profile.avatar}
          </div>
        </div>

        <div className="inline-flex items-center gap-1.5 rounded-full border border-orange-200 bg-orange-50 px-3 py-1 text-[11px] font-semibold text-orange-700 mb-4">
          <Sparkles className="size-3.5 text-orange-500" />
          {profile.matchScore}% Compatible Match
        </div>

        <h2 className="text-xl font-bold text-[#242322] leading-tight">
          It's a strong match!
        </h2>
        <p className="mt-2 text-sm text-[#77736e] leading-relaxed">
          You and {profile.name} both want to{" "}
          <span className="font-semibold text-[#242322]">
            {profile.goals[0]?.toLowerCase() ?? "collaborate"}
          </span>
          .
        </p>

        <div className="mt-5 space-y-2.5">
          <button
            type="button"
            onClick={onChat}
            className="w-full inline-flex items-center justify-center gap-2 rounded-2xl bg-[#1a1918] py-3.5 text-sm font-bold text-white shadow-md transition hover:bg-orange-600"
          >
            <MessageCircle className="size-4" />
            Start Conversation
          </button>
          <button
            type="button"
            onClick={onClose}
            className="w-full inline-flex items-center justify-center gap-2 rounded-2xl border border-[#e4ded5] bg-white py-3.5 text-sm font-semibold text-[#55504b] transition hover:border-orange-300 hover:bg-[#faf8f5]"
          >
            Keep Discovering
          </button>
        </div>
      </div>
    </div>
  );
}
