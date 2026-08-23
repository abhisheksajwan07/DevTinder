import type { DevProfile } from "../../mock-data";

interface ProfilePanelProps {
  participant: DevProfile;
}

export default function ProfilePanel({ participant }: ProfilePanelProps) {
  return (
    <aside className="hidden xl:flex flex-col w-[280px] shrink-0 border-l border-[#e9e5df] bg-white overflow-y-auto">
      <div className="p-5 text-center border-b border-[#f0ece6]">
        <div
          className="size-16 rounded-2xl grid place-items-center text-white font-bold text-xl mx-auto shadow-sm"
          style={{ backgroundColor: participant.avatarColor }}
        >
          {participant.avatar}
        </div>
        <h3 className="mt-3 text-sm font-bold text-[#242322]">
          {participant.name}
        </h3>
        <p className="font-mono text-[10px] text-[#77736e]">
          @{participant.username}
        </p>
        <p className="mt-1 text-xs text-[#77736e]">
          {participant.role} · {participant.experience}
        </p>
      </div>

      <div className="p-5 space-y-5">
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

        <div>
          <p className="font-mono text-[10px] font-bold uppercase tracking-wider text-[#88827c] mb-2.5">
            Bio
          </p>
          <p className="text-xs text-[#55504b] leading-relaxed">
            {participant.bio}
          </p>
        </div>

        <div className="rounded-2xl border border-orange-200 bg-orange-50 px-4 py-3 text-center">
          <p className="font-mono text-lg font-bold text-orange-600">
            {participant.matchScore}%
          </p>
          <p className="font-mono text-[10px] text-orange-600 uppercase tracking-wider">
            Compatible
          </p>
        </div>
      </div>
    </aside>
  );
}
