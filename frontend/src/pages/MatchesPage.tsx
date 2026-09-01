import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useMatches } from "../hooks/matches.hooks";
import { useConnectionRequests } from "../hooks/connection-requests.hooks";
import { useRespondConnection } from "../hooks/swipe.hook";
import MatchCard from "../components/matches/MatchCard";
import RequestCard from "../components/matches/RequestCard";
import MatchesEmptyState from "../components/matches/MatchesEmptyState";

type Tab = "matches" | "requests";

export default function MatchesPage() {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState<Tab>("matches");

  const matchesQuery = useMatches();
  const requestsQuery = useConnectionRequests();
  const respondMutation = useRespondConnection();

  const matches = matchesQuery.data ?? [];
  const requests = requestsQuery.data ?? [];

  // Which card failed? Only that one gets the error animation
  const failedId = respondMutation.isError
    ? respondMutation.variables?.targetProfileId
    : null;

  const isLoading =
    activeTab === "matches" ? matchesQuery.isLoading : requestsQuery.isLoading;
  const isError =
    activeTab === "matches" ? matchesQuery.isError : requestsQuery.isError;
  const refetch =
    activeTab === "matches" ? matchesQuery.refetch : requestsQuery.refetch;

  if (isLoading) {
    return (
      <div className="mx-auto max-w-2xl px-4 py-16 text-center text-sm text-[#77736e]">
        Loading…
      </div>
    );
  }

  if (isError) {
    return (
      <div className="mx-auto max-w-2xl px-4 py-16 text-center">
        <h2 className="text-base font-bold text-[#242322]">
          Could not load this page
        </h2>
        <button
          onClick={() => refetch()}
          className="mt-4 rounded-2xl bg-[#1a1918] px-5 py-2.5 text-sm font-bold text-white hover:bg-orange-600 transition"
        >
          Try again
        </button>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-2xl px-4 py-6 sm:py-8">
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-xl font-bold text-[#242322]">Your Connections</h1>
        <p className="mt-0.5 text-xs text-[#77736e]">
          Manage connection requests and start conversations with your matches.
        </p>
      </div>

      {/* Tabs */}
      <div className="mb-6 flex gap-1 rounded-2xl border border-[#e9e5df] bg-[#f7f5f2] p-1">
        <button
          onClick={() => setActiveTab("matches")}
          className={`flex-1 rounded-xl py-2 text-xs font-semibold transition ${
            activeTab === "matches"
              ? "border border-[#e9e5df] bg-white text-[#242322] shadow-xs"
              : "text-[#77736e]"
          }`}
        >
          Matches{" "}
          {matches.length > 0 && (
            <span className="ml-1 rounded-full bg-[#e9e5df] px-1.5 py-0.5 font-mono text-[10px]">
              {matches.length}
            </span>
          )}
        </button>
        <button
          onClick={() => setActiveTab("requests")}
          className={`flex-1 rounded-xl py-2 text-xs font-semibold transition ${
            activeTab === "requests"
              ? "border border-[#e9e5df] bg-white text-[#242322] shadow-xs"
              : "text-[#77736e]"
          }`}
        >
          Requests{" "}
          {requests.length > 0 && (
            <span className="ml-1 rounded-full bg-orange-100 px-1.5 py-0.5 font-mono text-[10px] text-orange-600">
              {requests.length}
            </span>
          )}
        </button>
      </div>

      {/* Content */}
      {activeTab === "matches" ? (
        matches.length === 0 ? (
          <MatchesEmptyState
            title="No matches yet"
            description="Keep discovering developers to find your next collaborator."
            onDiscover={() => navigate("/app/discover")}
          />
        ) : (
          <div className="space-y-3">
            {matches.map((match) => (
              <MatchCard key={match.id} match={match} />
            ))}
          </div>
        )
      ) : requests.length === 0 ? (
        <MatchesEmptyState
          title="No connection requests"
          description="New requests from developers will appear here."
          onDiscover={() => navigate("/app/discover")}
        />
      ) : (
        <div className="space-y-3">
          {requests.map((request) => (
            <RequestCard
              key={request.actionId}
              request={request}
              isPending={respondMutation.isPending}
              isError={request.profile.id === failedId}
              onAccept={(targetProfileId) =>
                respondMutation.mutate({ targetProfileId, action: "accept" })
              }
              onReject={(targetProfileId) =>
                respondMutation.mutate({ targetProfileId, action: "reject" })
              }
            />
          ))}
        </div>
      )}
    </div>
  );
}
