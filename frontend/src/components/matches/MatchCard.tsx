import { MessageCircle, User } from "lucide-react";
import { useNavigate } from "react-router-dom";
import ConnectionProfile from "./ConnectionProfile";
import type { Match } from "../../types/match";
import { useConversations } from "../../hooks/chat.hooks";

export default function MatchCard({ match }: { match: Match }) {
  const navigate = useNavigate();
  const { conversations = [] } = useConversations();

  const handleMessageClick = () => {
    const existingConv = conversations.find(
      (c) => c.otherProfileId === match.profile.id
    );
    if (existingConv) {
      navigate(`/app/chat/${existingConv.conversationId}`);
    } else {
      navigate("/app/chat");
    }
  };

  return (
    <div className="rounded-[24px] border border-[#e9e5df] bg-white p-5 shadow-xs transition hover:border-orange-200 hover:shadow-sm">
      <ConnectionProfile profile={match.profile} />
      <div className="mt-4 flex justify-end gap-2">
        <button
          onClick={() => navigate(`/app/profile/${match.profile.username}`)}
          className="inline-flex items-center gap-1.5 rounded-xl border border-[#e4ded5] px-3 py-1.5 text-xs font-semibold text-[#55504b] hover:border-orange-300 hover:bg-orange-50 transition"
        >
          <User className="size-3.5" /> Profile
        </button>
        <button
          onClick={handleMessageClick}
          className="inline-flex items-center gap-1.5 rounded-xl bg-[#1a1918] px-3 py-1.5 text-xs font-bold text-white hover:bg-orange-600 transition"
        >
          <MessageCircle className="size-3.5" /> Message
        </button>
      </div>
    </div>
  );
}
