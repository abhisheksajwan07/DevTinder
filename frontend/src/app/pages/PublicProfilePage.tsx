import { Github, ArrowLeft, Clock, Sparkles } from "lucide-react";
import { useNavigate, useParams } from "react-router-dom";
import { developerProfiles } from "../mock-data";

export default function PublicProfilePage() {
  const navigate = useNavigate();
  const { username } = useParams<{ username: string }>();
  const profile = developerProfiles.find((candidate) => candidate.username === username);

  if (!profile) {
    return (
      <div className="mx-auto max-w-2xl px-4 py-16 text-center">
        <h1 className="text-xl font-bold text-[#242322]">Profile not found</h1>
        <p className="mt-2 text-sm text-[#77736e]">This developer profile is no longer available.</p>
        <button type="button" onClick={() => navigate(-1)} className="mt-5 rounded-2xl bg-[#1a1918] px-5 py-3 text-sm font-bold text-white hover:bg-orange-600">Go back</button>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-2xl px-4 py-6 sm:py-8">
      <button type="button" onClick={() => navigate(-1)} className="mb-5 inline-flex items-center gap-2 text-xs font-semibold text-[#77736e] hover:text-[#242322]"><ArrowLeft className="size-4" /> Back</button>
      <div className="overflow-hidden rounded-[28px] border border-[#e9e5df] bg-white shadow-sm">
        <div className="border-b border-[#f0ece6] p-6">
          <div className="flex items-start gap-4">
            <div className="grid size-16 shrink-0 place-items-center rounded-2xl text-lg font-bold text-white" style={{ backgroundColor: profile.avatarColor }}>{profile.avatar}</div>
            <div className="min-w-0 flex-1">
              <h1 className="text-xl font-bold text-[#242322]">{profile.name}</h1>
              <p className="font-mono text-xs text-[#77736e]">@{profile.username}</p>
              <div className="mt-3 flex flex-wrap gap-2 text-xs text-[#77736e]"><span className="rounded-full bg-[#f7f5f2] px-2.5 py-1">{profile.role}</span><span className="rounded-full bg-[#f7f5f2] px-2.5 py-1">{profile.experience}</span><span className="inline-flex items-center gap-1 rounded-full bg-[#f7f5f2] px-2.5 py-1"><Clock className="size-3" />{profile.availability}</span></div>
            </div>
          </div>
          <p className="mt-5 text-sm leading-relaxed text-[#55504b]">{profile.bio}</p>
        </div>
        <div className="space-y-5 p-6">
          <ProfileGroup title="Skills" items={profile.skills} />
          <ProfileGroup title="Interests" items={profile.interests} accent />
          <ProfileGroup title="Looking for" items={profile.goals} icon />
          {profile.projectDescription && <div><Label>Project</Label><p className="text-sm leading-relaxed text-[#55504b]">{profile.projectDescription}</p></div>}
          <a href={`https://github.com/${profile.githubUsername}`} target="_blank" rel="noreferrer" className="inline-flex items-center gap-2 rounded-xl border border-[#e9e5df] bg-[#f7f5f2] px-3.5 py-2 text-xs font-semibold text-[#242322] hover:border-orange-300"><Github className="size-4" /> github.com/{profile.githubUsername}</a>
        </div>
      </div>
    </div>
  );
}

function Label({ children }: { children: React.ReactNode }) { return <p className="mb-2.5 font-mono text-[10px] font-bold uppercase tracking-wider text-[#88827c]">{children}</p>; }

function ProfileGroup({ title, items, accent, icon }: { title: string; items: string[]; accent?: boolean; icon?: boolean }) {
  return <div><Label>{title}</Label><div className="flex flex-wrap gap-1.5">{items.map((item) => <span key={item} className={`inline-flex items-center gap-1 rounded-full border border-[#e9e5df] px-3 py-1 text-[11px] font-semibold ${accent ? "bg-orange-50/60 text-orange-700" : "bg-[#f7f5f2] text-[#55504b]"}`}>{icon && <Sparkles className="size-3 text-orange-500" />}{item}</span>)}</div></div>;
}
