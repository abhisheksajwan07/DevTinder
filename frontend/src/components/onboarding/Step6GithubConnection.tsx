import { Check, Code2, Github, ShieldCheck } from "lucide-react";
import type { Availability, Experience, Role } from "../../app/mock-data";

interface Step6Props {
  firstName: string;
  lastName: string;
  username: string;
  selectedRole: Role | null;
  selectedExp: Experience | null;
  selectedAvailability: Availability | null;
  selectedSkills: string[];
}

export default function Step6GithubConnection({ firstName, lastName, username, selectedRole, selectedExp, selectedAvailability, selectedSkills }: Step6Props) {
  const connectGithub = () => {
    window.location.assign(`${import.meta.env.VITE_API_URL || "/v1"}/oauth/github/connect`);
  };

  return (
    <div className="mt-7">
      <h1 className="font-serif text-3xl font-normal leading-tight text-[#1a1918]">Connect GitHub.</h1>
      <p className="mt-2 text-sm text-[#77736e]">Optional. You can connect now or do it later from your profile.</p>
      <div className="mt-6 rounded-2xl border border-[#e9e5df] bg-gradient-to-br from-[#faf8f5] to-white p-5 shadow-xs">
        <div className="flex items-start gap-4">
          <div className="grid size-12 shrink-0 place-items-center rounded-2xl bg-[#1a1918] text-white"><Github className="size-6" /></div>
          <div className="flex-1"><h2 className="text-base font-bold text-[#242322]">Import your developer work</h2><p className="mt-1 text-xs leading-relaxed text-[#77736e]">GitHub repositories enrich your profile and help matching understand your technical experience.</p><button type="button" onClick={connectGithub} className="mt-4 inline-flex items-center gap-2 rounded-2xl bg-[#1a1918] px-5 py-3 text-xs font-bold text-white hover:bg-orange-600"><Github className="size-4" />Connect GitHub</button></div>
        </div>
        <div className="mt-5 grid grid-cols-2 gap-3 border-t border-[#f0ece6] pt-4 text-[11px] text-[#55504b]"><span className="flex items-center gap-2"><ShieldCheck className="size-3.5 text-orange-500" />Verified profile signal</span><span className="flex items-center gap-2"><Code2 className="size-3.5 text-orange-500" />Feature up to 3 repos</span></div>
      </div>
      <div className="mt-5 rounded-2xl border border-[#e9e5df] bg-[#f7f5f2] p-4 text-xs text-[#55504b]"><p className="mb-2 font-mono text-[10px] font-bold uppercase tracking-wider text-[#77736e]">Profile preview</p><p className="font-semibold text-[#242322]">{firstName} {lastName} · @{username}</p><p className="mt-1">{selectedRole} · {selectedExp} · {selectedAvailability}</p><div className="mt-3 flex flex-wrap gap-1.5">{selectedSkills.slice(0, 5).map((skill) => <span key={skill} className="inline-flex items-center gap-1 rounded-full border border-[#e9e5df] bg-white px-2.5 py-1 font-mono text-[10px] font-semibold"><Check className="size-3 text-emerald-600" />{skill}</span>)}</div></div>
    </div>
  );
}
