import { useState } from "react";
import { useFeed } from "../hooks/feed.hooks";
import ProfileCard from "../components/discover/ProfileCard";
import FeedPreparing from "../components/discover/FeedPreparing";
import { useSwipeProfile } from "../hooks/swipe.hook";
import { SwipeAction } from "../types/swipe";

export default function DiscoverPage() {
  const { data: profiles, isLoading, error, refetch, isRefetching } = useFeed();
  const [animationDone, setAnimationDone] = useState(() => Boolean(profiles));
  const swipeMutation = useSwipeProfile();
  const isPreparing = (error as any)?.response?.status === 503;
  const errorCode = (error as any)?.response?.data?.code;

  const isEmbeddingFailed = errorCode === "EMBEDDING_FAILED";

  if (error && !isPreparing && !isEmbeddingFailed) {
    return (
      <div className="mx-auto max-w-2xl px-4 py-16 text-center">
        <div className="rounded-[28px] border border-[#e9e5df] bg-white p-8 shadow-sm">
          <h2 className="text-base font-bold text-[#242322]">
            We couldn’t load your feed
          </h2>
          <p className="mt-2 text-sm text-[#77736e]">
            Please try again in a moment.
          </p>
          <button
            type="button"
            onClick={() => refetch()}
            disabled={isRefetching}
            className="mt-5 rounded-2xl bg-[#1a1918] px-5 py-2.5 text-xs font-bold text-white transition hover:bg-orange-600 disabled:opacity-50"
          >
            {isRefetching ? "Retrying…" : "Try again"}
          </button>
        </div>
      </div>
    );
  }

  const isDataReady = !isLoading && !isPreparing && !!profiles;

  if (isEmbeddingFailed) {
    return (
      <div className="mx-auto max-w-2xl px-4 py-16 text-center">
        <div className="rounded-[28px] border border-red-200 bg-white p-8 shadow-sm">
          <h2 className="text-base font-bold text-[#242322]">
            We couldn’t prepare your recommendations
          </h2>
          <p className="mt-2 text-sm text-[#77736e]">
            Something went wrong while preparing your developer matches. Please
            try again.
          </p>
          <button
            type="button"
            onClick={() => refetch()}
            disabled={isRefetching}
            className="mt-5 rounded-2xl bg-[#1a1918] px-5 py-2.5 text-xs font-bold text-white transition hover:bg-orange-600 disabled:opacity-50"
          >
            {isRefetching ? "Trying again…" : "Try again"}
          </button>
        </div>
      </div>
    );
  }

  if (!animationDone) {
    return (
      <FeedPreparing
        isDataReady={isDataReady}
        onFinish={() => setAnimationDone(true)}
      />
    );
  }

  const currentProfile = profiles?.[0];

  const handleSwipe = (action: SwipeAction) => {
    if (!currentProfile) return;
    swipeMutation.mutate({
      targetProfileId: currentProfile.id,
      action,
    });
  };

  return (
    <div className="mx-auto max-w-2xl px-4 py-5 sm:py-8">
      {/* Header */}
      <div className="mb-6 flex items-start justify-between gap-3">
        <div>
          <h1 className="text-xl font-bold text-[#242322]">
            Discover Developers
          </h1>
          <p className="text-xs text-[#77736e] mt-0.5">
            Find developers matching your tech stack and interests
          </p>
        </div>
      </div>

      {/* Feed content area */}
      <div className="mx-auto py-1">
        {currentProfile ? (
          <ProfileCard
            key={currentProfile.id}
            profile={currentProfile}
            handlePass={() => {
              handleSwipe("skip");
            }}
            handleLike={() => {
              handleSwipe("connect");
            }}
          />
        ) : (
          <div className="text-center py-16 rounded-[28px] border border-[#e9e5df] bg-white p-8 shadow-xs">
            <div className="text-4xl mb-3">✨</div>
            <h3 className="text-base font-bold text-[#242322]">
              All caught up!
            </h3>
            <p className="mt-1.5 text-xs text-[#77736e] max-w-sm mx-auto">
              You've reviewed all available recommendations for now. Check back
              later for new developers matching your profile.
            </p>
            <button
              type="button"
              onClick={() => refetch()}
              disabled={isRefetching}
              className="mt-5 inline-flex items-center gap-2 rounded-2xl bg-[#1a1918] px-5 py-2.5 text-xs font-bold text-white transition hover:bg-orange-600 active:scale-95 disabled:opacity-50"
            >
              {isRefetching ? "Refreshing..." : "Check for new profiles"}
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
