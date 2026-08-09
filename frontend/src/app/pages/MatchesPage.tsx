import { useState } from "react";
import { matches } from "../mock-data";
import { MessageCircle, User, Sparkles, Clock } from "lucide-react";
import { useNavigate } from "react-router-dom";

type Tab = "all" | "new" | "active" | "archived";

export default function MatchesPage() {
  const [activeTab, setActiveTab] = useState<Tab>("all");
  const navigate = useNavigate();

  const filtered = matches.filter((m) => {
    if (activeTab === "all") return true;
    if (activeTab === "new") return m.isNew;
    if (activeTab === "active") return m.isActive;
    if (activeTab === "archived") return !m.isActive;
    return true;
  });

  const tabs: { id: Tab; label: string; count?: number }[] = [
    { id: "all", label: "All", count: matches.length },
    { id: "new", label: "New", count: matches.filter((m) => m.isNew).length },
    { id: "active", label: "Active", count: matches.filter((m) => m.isActive).length },
    { id: "archived", label: "Archived", count: matches.filter((m) => !m.isActive).length },
  ];

  return (
    <div className="max-w-2xl mx-auto px-4 py-6 sm:py-8">
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-xl font-bold text-[#242322]">Your Matches</h1>
        <p className="text-xs text-[#77736e] mt-0.5">
          Developers who matched with you. Start a conversation!
        </p>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 rounded-2xl border border-[#e9e5df] bg-[#f7f5f2] p-1 mb-6">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            type="button"
            onClick={() => setActiveTab(tab.id)}
            className={`flex-1 flex items-center justify-center gap-1.5 rounded-xl py-2 text-xs font-semibold transition-all ${
              activeTab === tab.id
                ? "bg-white text-[#242322] shadow-xs border border-[#e9e5df]"
                : "text-[#77736e] hover:text-[#242322]"
            }`}
          >
            {tab.label}
            {tab.count !== undefined && tab.count > 0 && (
              <span
                className={`rounded-full px-1.5 py-0.5 font-mono text-[10px] font-bold ${
                  activeTab === tab.id
                    ? "bg-orange-100 text-orange-600"
                    : "bg-[#e9e5df] text-[#77736e]"
                }`}
              >
                {tab.count}
              </span>
            )}
          </button>
        ))}
      </div>

      {/* Empty State */}
      {filtered.length === 0 && (
        <div className="text-center py-16">
          <div className="text-4xl mb-3">💌</div>
          <h3 className="text-base font-bold text-[#242322]">No {activeTab} matches yet</h3>
          <p className="mt-1.5 text-sm text-[#77736e]">
            {activeTab === "new"
              ? "When developers match with you for the first time, they'll appear here."
              : "Keep discovering developers to find your next collaborator!"}
          </p>
          <button
            type="button"
            onClick={() => navigate("/app/discover")}
            className="mt-5 inline-flex items-center gap-2 rounded-2xl bg-[#1a1918] px-5 py-3 text-sm font-bold text-white transition hover:bg-orange-600"
          >
            <Sparkles className="size-4" />
            Discover Developers
          </button>
        </div>
      )}

      {/* Match Cards */}
      <div className="space-y-3">
        {filtered.map((match) => (
          <div
            key={match.id}
            className="rounded-[24px] border border-[#e9e5df] bg-white p-5 shadow-xs transition hover:border-orange-200 hover:shadow-sm"
          >
            <div className="flex items-start gap-4">
              <div className="relative shrink-0">
                <div
                  className="size-12 rounded-2xl grid place-items-center text-white font-bold text-sm shadow-xs"
                  style={{ backgroundColor: match.profile.avatarColor }}
                >
                  {match.profile.avatar}
                </div>
                {match.profile.isOnline && (
                  <span className="absolute -bottom-0.5 -right-0.5 size-3 rounded-full border-2 border-white bg-emerald-500" />
                )}
              </div>

              <div className="flex-1 min-w-0">
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <div className="flex items-center gap-2">
                      <h3 className="text-sm font-bold text-[#242322]">
                        {match.profile.name}
                      </h3>
                      {match.isNew && (
                        <span className="rounded-full bg-orange-500 px-2 py-0.5 font-mono text-[9px] font-bold text-white uppercase tracking-wider">
                          New
                        </span>
                      )}
                    </div>
                    <p className="text-xs text-[#77736e]">
                      {match.profile.role} · {match.profile.experience}
                    </p>
                  </div>

                  <div className="shrink-0 text-right">
                    <p className="font-mono text-sm font-bold text-orange-600">
                      {match.profile.matchScore}%
                    </p>
                    <p className="font-mono text-[10px] text-[#88827c]">match</p>
                  </div>
                </div>

                {/* Shared Info */}
                <div className="mt-3">
                  <p className="font-mono text-[10px] font-bold uppercase tracking-wider text-[#88827c] mb-1.5">
                    Shared
                  </p>
                  <div className="flex flex-wrap gap-1.5">
                    {match.sharedSkills.map((skill) => (
                      <span
                        key={skill}
                        className="rounded-full border border-[#e9e5df] bg-[#f7f5f2] px-2.5 py-0.5 font-mono text-[10px] font-semibold text-[#55504b]"
                      >
                        {skill}
                      </span>
                    ))}
                    {match.sharedInterests.map((interest) => (
                      <span
                        key={interest}
                        className="rounded-full border border-orange-200 bg-orange-50 px-2.5 py-0.5 text-[10px] font-semibold text-orange-700"
                      >
                        {interest}
                      </span>
                    ))}
                  </div>
                </div>

                {/* Last Activity */}
                <div className="mt-3 flex items-center justify-between">
                  <span className="flex items-center gap-1 font-mono text-[10px] text-[#88827c]">
                    <Clock className="size-3" />
                    {match.lastActivity}
                  </span>
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => navigate(`/app/profile/${match.profile.username}`)}
                      className="flex items-center gap-1.5 rounded-xl border border-[#e4ded5] bg-white px-3 py-1.5 text-xs font-semibold text-[#55504b] transition hover:border-orange-300 hover:bg-orange-50"
                    >
                      <User className="size-3.5" />
                      Profile
                    </button>
                    <button
                      type="button"
                      onClick={() => navigate("/app/chat")}
                      className="flex items-center gap-1.5 rounded-xl bg-[#1a1918] px-3 py-1.5 text-xs font-bold text-white transition hover:bg-orange-600"
                    >
                      <MessageCircle className="size-3.5" />
                      Message
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
