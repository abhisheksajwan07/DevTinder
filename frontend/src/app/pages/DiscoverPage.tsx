import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { developerProfiles } from "../mock-data";
import MatchModal from "../../components/discover/MatchModal";
import ProfileCard from "../../components/discover/ProfileCard";

export default function DiscoverPage() {
  const navigate = useNavigate();
  const [currentIndex, setCurrentIndex] = useState(0);
  const [showMatch, setShowMatch] = useState(false);
  const [passed, setPassed] = useState<string[]>([]);

  const remaining = developerProfiles.filter((p) => !passed.includes(p.id));
  const profile = remaining[currentIndex % remaining.length];

  const handlePass = () => {
    setPassed((prev) => [...prev, profile.id]);
    setCurrentIndex(0);
  };

  const handleLike = () => {
    if (profile.matchScore >= 85) setShowMatch(true);
    else {
      setPassed((prev) => [...prev, profile.id]);
      setCurrentIndex(0);
    }
  };

  if (remaining.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-[calc(100vh-8rem)] px-6 text-center">
        <div className="text-5xl mb-4">🎉</div>
        <h2 className="text-xl font-bold text-[#242322]">You've seen everyone!</h2>
        <p className="mt-2 text-sm text-[#77736e]">New developers join every day. Check back soon.</p>
        <button
          type="button"
          onClick={() => {
            setPassed([]);
            setCurrentIndex(0);
          }}
          className="mt-6 rounded-2xl bg-[#1a1918] px-6 py-3 text-sm font-bold text-white transition hover:bg-orange-600"
        >
          Start Over
        </button>
      </div>
    );
  }

  return (
    <>
      {showMatch && profile && (
        <MatchModal
          profile={profile}
          onClose={() => {
            setShowMatch(false);
            setPassed((prev) => [...prev, profile.id]);
            setCurrentIndex(0);
          }}
          onChat={() => {
            setShowMatch(false);
            navigate("/app/chat");
          }}
        />
      )}

      <div className="max-w-2xl mx-auto px-4 py-6 sm:py-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-xl font-bold text-[#242322]">Discover Developers</h1>
            <p className="text-xs text-[#77736e] mt-0.5">
              {remaining.length} developers matching your profile
            </p>
          </div>
        </div>

        {/* Profile Card */}
        <ProfileCard
          profile={profile}
          handlePass={handlePass}
          handleLike={handleLike}
          setShowMatch={setShowMatch}
        />

        {/* Navigation Dots */}
        <div className="flex justify-center gap-1.5 mt-5">
          {remaining.slice(0, 5).map((_, i) => (
            <button
              key={i}
              type="button"
              onClick={() => setCurrentIndex(i)}
              className={`h-1.5 rounded-full transition-all ${
                i === currentIndex % remaining.length
                  ? "w-6 bg-orange-500"
                  : "w-1.5 bg-[#d4cec6]"
              }`}
            />
          ))}
        </div>
      </div>
    </>
  );
}
