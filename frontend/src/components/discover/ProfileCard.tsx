import { FeedProfile } from "../../types/feed";
import { X, Heart, Star, Sparkles, Clock, Github } from "lucide-react";
import { gsap } from "gsap";
import { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";

interface ProfileCardProps {
  profile: FeedProfile;
  handlePass: () => void;
  handleLike: () => void;
}

export default function ProfileCard({
  profile,
  handlePass,
  handleLike,
}: ProfileCardProps) {
  const cardRef = useRef<HTMLDivElement>(null);
  const [isAnimating, setIsAnimating] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    if (!cardRef.current) return;

    gsap.fromTo(
      cardRef.current,
      { y: 18, opacity: 0, scale: 0.98 },
      { y: 0, opacity: 1, scale: 1, duration: 0.35, ease: "power2.out" },
    );
  }, []);

  const animateSwipe = (direction: "left" | "right", callback: () => void) => {
    if (isAnimating || !cardRef.current) return;

    setIsAnimating(true);
    gsap.to(cardRef.current, {
      x: direction === "left" ? -window.innerWidth * 0.9 : window.innerWidth * 0.9,
      rotation: direction === "left" ? -14 : 14,
      opacity: 0,
      duration: 0.42,
      ease: "power2.in",
      onComplete: callback,
    });
  };

  return (
    <div
      ref={cardRef}
      className="rounded-[28px] border border-[#e9e5df] bg-white shadow-sm overflow-hidden will-change-transform"
    >
      {/* Card Header */}
      <div className="p-6 pb-4 border-b border-[#f0ece6]">
        <div className="flex items-start gap-4">
          <div className="size-14 rounded-2xl grid place-items-center text-white font-bold text-lg shrink-0 shadow-sm">
            {profile.avatar?.imageUrl ? (
              <img
                src={profile.avatar.imageUrl}
                alt={profile.firstName}
                className="size-full object-cover"
              />
            ) : (
              <div className="size-full grid place-items-center bg-orange-500 text-white font-bold text-lg">
                {profile.firstName[0]?.toUpperCase()}
              </div>
            )}
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-start justify-between gap-2">
              <div>
                <h2 className="text-lg font-bold text-[#242322]">
                  {profile.firstName}
                </h2>
                <p className="font-mono text-xs text-[#77736e]">
                  @{profile.username}
                </p>
              </div>
              <div className="shrink-0 rounded-2xl border border-orange-200 bg-orange-50 px-3 py-1.5 text-center">
                <p className="font-mono text-base font-bold text-orange-600 leading-tight">
                  {profile.matchScore}%
                </p>
                <p className="font-mono text-[9px] font-bold uppercase tracking-wider text-orange-500 leading-tight">
                  Match
                </p>
              </div>
            </div>

            <div className="mt-2 flex flex-wrap items-center gap-2 text-xs text-[#77736e]">
              <span className="inline-flex items-center gap-1 rounded-full border border-[#e9e5df] bg-[#f7f5f2] px-2.5 py-1 font-medium">
                {profile.primaryRole}
              </span>
              <span className="inline-flex items-center gap-1 rounded-full border border-[#e9e5df] bg-[#f7f5f2] px-2.5 py-1 font-medium">
                {profile.experienceLevel}
              </span>
              <span className="inline-flex items-center gap-1 rounded-full border border-[#e9e5df] bg-[#f7f5f2] px-2.5 py-1 font-medium">
                <Clock className="size-3" />
                {profile.availability}
              </span>
             
            </div>
          </div>
        </div>

        <p className="mt-4 text-sm text-[#55504b] leading-relaxed">
          {profile.bio}
        </p>
        <button type="button" onClick={() => navigate(`/app/profile/${profile.username}`)} className="mt-3 text-xs font-semibold text-orange-600 hover:underline">
          View full profile
        </button>
      </div>

      {/* Skills */}
      <div className="px-6 py-4 border-b border-[#f0ece6]">
        <p className="font-mono text-[10px] font-bold uppercase tracking-wider text-[#88827c] mb-2.5">
          Skills
        </p>
        <div className="flex flex-wrap gap-1.5">
          {profile.skills.map((skill) => (
            <span
              key={skill.id}
              className="rounded-full border border-[#e9e5df] bg-[#f7f5f2] px-3 py-1 font-mono text-[11px] font-semibold text-[#55504b]"
            >
              {skill.name}
            </span>
          ))}
        </div>
      </div>

      {/* Interests */}
      <div className="px-6 py-4 border-b border-[#f0ece6]">
        <p className="font-mono text-[10px] font-bold uppercase tracking-wider text-[#88827c] mb-2.5">
          Interests
        </p>
        <div className="flex flex-wrap gap-1.5">
          {profile.interests.map((interest) => (
            <span
              key={interest.id}
              className="rounded-full border border-[#e9e5df] bg-orange-50/60 px-3 py-1 text-[11px] font-semibold text-orange-700"
            >
              {interest.name}
            </span>
          ))}
        </div>
      </div>

      {/* Goals */}
      <div className="px-6 py-4 border-b border-[#f0ece6]">
        <p className="font-mono text-[10px] font-bold uppercase tracking-wider text-[#88827c] mb-2.5">
          Looking For
        </p>
        <div className="flex flex-wrap gap-1.5">
          {profile.lookingFor.map((lf) => (
            <span
              key={lf.id}
              className="inline-flex items-center gap-1 rounded-full border border-[#e9e5df] bg-[#f7f5f2] px-3 py-1 text-[11px] font-semibold text-[#55504b]"
            >
              <Sparkles className="size-3 text-orange-500" />
              {lf.name}
            </span>
          ))}
        </div>
      </div>

     

      {/* Action Buttons */}
      <div className="px-6 py-5 flex items-center justify-center gap-5">
        <button
          type="button"
          onClick={() => animateSwipe("left", handlePass)}
          disabled={isAnimating}
          className="flex items-center gap-2 rounded-2xl border border-[#e4ded5] bg-white px-6 py-3 text-sm font-semibold text-[#77716b] shadow-xs transition hover:border-red-300 hover:bg-red-50 hover:text-red-600 active:scale-95"
        >
          <X className="size-4" />
          Not for me
        </button>

        <button
          type="button"
          onClick={() => animateSwipe("right", handleLike)}
          disabled={isAnimating}
          className="flex items-center gap-2 rounded-2xl bg-[#ee7100] px-6 py-3 text-sm font-bold text-white shadow-md shadow-orange-500/25 transition hover:bg-[#d96500] hover:shadow-lg hover:shadow-orange-500/35 active:scale-95"
        >
          <Heart className="size-4" />
          Interested
        </button>
      </div>
    </div>
  );
}
