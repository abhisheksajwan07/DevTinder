import { ExternalLink, Github, X, Zap } from "lucide-react";
import { Link } from "react-router-dom";

export interface ChatParticipantInfo {
  profileId: string;
  name: string;
  username: string;
  avatarUrl?: string | null;
  role?: string;
  experience?: string;
  bio?: string;
  skills?: string[];
  githubUsername?: string;
  matchScore?: number;
}

interface ProfilePanelProps {
  participant: ChatParticipantInfo;
  onClose?: () => void;
}

export default function ProfilePanel({
  participant,
  onClose,
}: ProfilePanelProps) {
  const initial = (
    participant.name?.[0] ||
    participant.username?.[0] ||
    "U"
  ).toUpperCase();
  return (
    <aside className="absolute inset-0 z-20 flex w-full flex-col overflow-y-auto border-l border-[#e9e5df] bg-white sm:relative sm:inset-auto sm:w-[300px] sm:shrink-0 xl:w-[320px]">
      <div className="flex items-center justify-between p-4 border-b border-[#f0ece6]">
        <span className="font-bold text-xs text-[#242322]">
          Developer Profile
        </span>
        {onClose && (
          <button
            type="button"
            onClick={onClose}
            aria-label="Close Profile Panel"
            className="flex size-7 items-center justify-center rounded-lg text-[#88827c] hover:bg-[#f7f5f2] hover:text-[#242322] transition"
          >
            <X className="size-4" />
          </button>
        )}
      </div>
      <div className="p-5 text-center border-b border-[#f0ece6]">
        {participant.avatarUrl ? (
          <img
            src={participant.avatarUrl}
            alt={participant.name}
            className="size-16 rounded-2xl object-cover border border-[#e9e5df] mx-auto shadow-sm"
          />
        ) : (
          <div className="size-16 rounded-2xl grid place-items-center bg-gradient-to-br from-orange-400 to-amber-500 text-white font-bold text-xl mx-auto shadow-sm">
            {initial}
          </div>
        )}
        <h3 className="mt-3 text-sm font-bold text-[#242322]">
          {participant.name}
        </h3>
        <p className="font-mono text-[10px] text-[#77736e]">
          @{participant.username}
        </p>
        {(participant.role || participant.experience) && (
          <p className="mt-1 text-xs text-[#77736e]">
            {[participant.role, participant.experience]
              .filter(Boolean)
              .join(" · ")}
          </p>
        )}
      </div>
      <div className="p-5 space-y-5">
        {participant.skills && participant.skills.length > 0 && (
          <div>
            <p className="font-mono text-[10px] font-bold uppercase tracking-wider text-[#88827c] mb-2.5">
              Skills
            </p>
            <div className="flex flex-wrap gap-1.5">
              {participant.skills.map((skill) => (
                <span
                  key={skill}
                  className="rounded-full border border-[#e9e5df] bg-[#f7f5f2] px-2.5 py-1 font-mono text-[10px] font-semibold text-[#55504b]"
                >
                  {skill}
                </span>
              ))}
            </div>
          </div>
        )}
        {participant.bio && (
          <div>
            <p className="font-mono text-[10px] font-bold uppercase tracking-wider text-[#88827c] mb-2.5">
              Bio
            </p>
            <p className="text-xs text-[#55504b] leading-relaxed">
              {participant.bio}
            </p>
          </div>
        )}
        {participant.matchScore !== undefined && (
          <div className="rounded-2xl border border-orange-200 bg-orange-50 px-4 py-3 text-center">
            <div className="flex items-center justify-center gap-1 text-orange-600">
              <Zap className="size-3.5" />
              <span className="font-mono text-lg font-bold">
                {participant.matchScore}%
              </span>
            </div>
            <p className="font-mono text-[10px] text-orange-600 uppercase tracking-wider">
              Compatible
            </p>
          </div>
        )}
        {participant.githubUsername && (
          <Link
            to={`/app/profile/${participant.username}`}
            className="flex items-center justify-between rounded-xl border border-[#e9e5df] px-3 py-2 text-xs font-semibold text-[#55504b] hover:bg-[#f7f5f2]"
          >
            <span className="flex items-center gap-2">
              <Github className="size-4" /> GitHub
            </span>
            <ExternalLink className="size-3.5" />
          </Link>
        )}
      </div>
    </aside>
  );
}
