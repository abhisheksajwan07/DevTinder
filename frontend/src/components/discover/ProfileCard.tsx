import type { DevProfile } from "../../app/mock-data";
import { X, Heart, Star, Sparkles, Clock, Github } from "lucide-react";

interface ProfileCardProps {
  profile: DevProfile;
  handlePass: () => void;
  handleLike: () => void;
  setShowMatch: (val: boolean) => void;
}

export default function ProfileCard({
  profile,
  handlePass,
  handleLike,
  setShowMatch,
}: ProfileCardProps) {
  return (
    <div className="rounded-[28px] border border-[#e9e5df] bg-white shadow-sm overflow-hidden">
      {/* Card Header */}
      <div className="p-6 pb-4 border-b border-[#f0ece6]">
        <div className="flex items-start gap-4">
          <div
            className="size-14 rounded-2xl grid place-items-center text-white font-bold text-lg shrink-0 shadow-sm"
            style={{ backgroundColor: profile.avatarColor }}
          >
            {profile.avatar}
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-start justify-between gap-2">
              <div>
                <h2 className="text-lg font-bold text-[#242322]">{profile.name}</h2>
                <p className="font-mono text-xs text-[#77736e]">@{profile.username}</p>
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
                {profile.role}
              </span>
              <span className="inline-flex items-center gap-1 rounded-full border border-[#e9e5df] bg-[#f7f5f2] px-2.5 py-1 font-medium">
                {profile.experience}
              </span>
              <span className="inline-flex items-center gap-1 rounded-full border border-[#e9e5df] bg-[#f7f5f2] px-2.5 py-1 font-medium">
                <Clock className="size-3" />
                {profile.availability}
              </span>
              {profile.isOnline && (
                <span className="inline-flex items-center gap-1 rounded-full border border-emerald-200 bg-emerald-50 px-2.5 py-1 font-medium text-emerald-700">
                  <span className="size-1.5 rounded-full bg-emerald-500" />
                  Online
                </span>
              )}
            </div>
          </div>
        </div>

        <p className="mt-4 text-sm text-[#55504b] leading-relaxed">{profile.bio}</p>
      </div>

      {/* Skills */}
      <div className="px-6 py-4 border-b border-[#f0ece6]">
        <p className="font-mono text-[10px] font-bold uppercase tracking-wider text-[#88827c] mb-2.5">
          Skills
        </p>
        <div className="flex flex-wrap gap-1.5">
          {profile.skills.map((skill) => (
            <span
              key={skill}
              className="rounded-full border border-[#e9e5df] bg-[#f7f5f2] px-3 py-1 font-mono text-[11px] font-semibold text-[#55504b]"
            >
              {skill}
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
              key={interest}
              className="rounded-full border border-[#e9e5df] bg-orange-50/60 px-3 py-1 text-[11px] font-semibold text-orange-700"
            >
              {interest}
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
          {profile.goals.map((goal) => (
            <span
              key={goal}
              className="inline-flex items-center gap-1 rounded-full border border-[#e9e5df] bg-[#f7f5f2] px-3 py-1 text-[11px] font-semibold text-[#55504b]"
            >
              <Sparkles className="size-3 text-orange-500" />
              {goal}
            </span>
          ))}
        </div>
      </div>

      {/* Compatibility Reasons */}
      <div className="px-6 py-4 border-b border-[#f0ece6]">
        <p className="font-mono text-[10px] font-bold uppercase tracking-wider text-[#88827c] mb-2.5">
          Why You're Compatible
        </p>
        <div className="space-y-1.5">
          {[
            "Shared TypeScript & Node.js stack",
            "Both interested in SaaS & Open source",
            "Similar collaboration goals",
            "Compatible availability",
          ]
            .slice(0, 3)
            .map((reason) => (
              <div key={reason} className="flex items-center gap-2 text-xs text-[#55504b]">
                <span className="size-1.5 rounded-full bg-orange-500 shrink-0" />
                {reason}
              </div>
            ))}
        </div>
      </div>

      {/* Github Username */}
      <div className="px-6 py-4 border-b border-[#f0ece6]">
        <a
          href={`https://github.com/${profile.githubUsername}`}
          target="_blank"
          rel="noreferrer"
          className="inline-flex items-center gap-2 rounded-xl border border-[#e9e5df] bg-[#f7f5f2] px-3.5 py-2 text-xs font-semibold text-[#242322] hover:border-orange-300 transition"
        >
          <Github className="size-4" />
          github.com/{profile.githubUsername}
        </a>
      </div>

      {/* Action Buttons */}
      <div className="px-6 py-5 flex items-center justify-center gap-5">
        <button
          type="button"
          onClick={handlePass}
          className="flex items-center gap-2 rounded-2xl border border-[#e4ded5] bg-white px-6 py-3 text-sm font-semibold text-[#77716b] shadow-xs transition hover:border-red-300 hover:bg-red-50 hover:text-red-600 active:scale-95"
        >
          <X className="size-4" />
          Not for me
        </button>

        <button
          type="button"
          onClick={handleLike}
          className="flex items-center gap-2 rounded-2xl bg-[#ee7100] px-6 py-3 text-sm font-bold text-white shadow-md shadow-orange-500/25 transition hover:bg-[#d96500] hover:shadow-lg hover:shadow-orange-500/35 active:scale-95"
        >
          <Heart className="size-4" />
          Interested
        </button>

        <button
          type="button"
          onClick={() => setShowMatch(true)}
          className="flex items-center gap-2 rounded-2xl border border-orange-300 bg-orange-50 px-4 py-3 text-sm font-semibold text-orange-700 shadow-xs transition hover:bg-orange-100 active:scale-95"
        >
          <Star className="size-4 fill-orange-400" />
          Strong Match
        </button>
      </div>
    </div>
  );
}
