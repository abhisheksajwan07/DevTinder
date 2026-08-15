import { Check, Code2, Github, ShieldCheck } from "lucide-react";
import { useWatch } from "react-hook-form";
import { useGitHubConnectionStatus } from "../../hooks/onboarding.hooks";
import type { OnboardingOptions } from "../../services/onboarding.api";
import {
  availabilityOptions,
  roleOptions,
  type OnboardingFormValues,
} from "../../types/onboarding";

export const ONBOARDING_DRAFT_STORAGE_KEY = "devtinder:onboarding-draft";

export default function Step6GithubConnection({
  skills,
}: Pick<OnboardingOptions, "skills">) {
  const values = useWatch<OnboardingFormValues>();
  const github = useGitHubConnectionStatus();
  const role = roleOptions.find(
    (option) => option.value === values.primaryRole,
  )?.label;
  const availability = availabilityOptions.find(
    (option) => option.value === values.availability,
  )?.label;
  const skillNames = skills
    .filter((skill) => values.skillIds?.includes(skill.id))
    .map((skill) => skill.name)
    .concat(values.customSkills ?? []);
  const connectGithub = () => {
    // OAuth redirects reload the SPA. Preserve the form so returning from
    // GitHub does not erase the user's onboarding progress.
    sessionStorage.setItem(
      ONBOARDING_DRAFT_STORAGE_KEY,
      JSON.stringify(values),
    );
    window.location.assign(
      `${import.meta.env.VITE_API_URL || "/v1"}/oauth/github/connect`,
    );
  };
  return (
    <div className="mt-7">
      <h1 className="font-serif text-3xl font-normal leading-tight text-[#1a1918]">
        Connect GitHub.
      </h1>
      <p className="mt-2 text-sm text-[#77736e]">
        {github.data?.connected
          ? "Your GitHub account is already connected. When you complete your profile, DevTinder will import repositories in the background."
          : "Optional. Connect GitHub now, or complete your profile and connect it later from settings."}
      </p>
      <div className="mt-6 rounded-2xl border border-[#e9e5df] bg-gradient-to-br from-[#faf8f5] to-white p-5 shadow-xs">
        <div className="flex items-start gap-4">
          <div className="grid size-12 shrink-0 place-items-center rounded-2xl bg-[#1a1918] text-white">
            <Github className="size-6" />
          </div>
          <div className="flex-1">
            <h2 className="text-base font-bold text-[#242322]">
              {github.isLoading
                ? "Checking GitHub…"
                : github.data?.connected
                  ? "GitHub connected"
                  : "Import your developer work"}
            </h2>
            <p className="mt-1 text-xs leading-relaxed text-[#77736e]">
              GitHub repositories enrich your profile and help matching
              understand your technical experience.
            </p>
            {!github.isLoading && !github.data?.connected && (
              <button
                type="button"
                onClick={connectGithub}
                className="mt-4 inline-flex items-center gap-2 rounded-2xl bg-[#1a1918] px-5 py-3 text-xs font-bold text-white hover:bg-orange-600"
              >
                <Github className="size-4" />
                Connect GitHub
              </button>
            )}
            {github.data?.connected && (
              <p className="mt-4 inline-flex items-center gap-2 rounded-2xl bg-emerald-50 px-4 py-2 text-xs font-bold text-emerald-700">
                <Check className="size-4" />
                Connected — import starts after profile creation
              </p>
            )}
          </div>
        </div>
        <div className="mt-5 grid grid-cols-2 gap-3 border-t border-[#f0ece6] pt-4 text-[11px] text-[#55504b]">
          <span className="flex items-center gap-2">
            <ShieldCheck className="size-3.5 text-orange-500" />
            OAuth token stays server-side
          </span>
          <span className="flex items-center gap-2">
            <Code2 className="size-3.5 text-orange-500" />
            Feature up to 3 repos
          </span>
        </div>
      </div>
      <div className="mt-5 rounded-2xl border border-[#e9e5df] bg-[#f7f5f2] p-4 text-xs text-[#55504b]">
        <p className="mb-2 font-mono text-[10px] font-bold uppercase tracking-wider text-[#77736e]">
          Profile preview
        </p>
        <p className="font-semibold text-[#242322]">
          {values.firstName} {values.lastName} · @{values.userName}
        </p>
        <p className="mt-1">
          {role} · {values.experienceLevel} · {availability}
        </p>
        <div className="mt-3 flex flex-wrap gap-1.5">
          {skillNames.slice(0, 5).map((skill) => (
            <span
              key={skill}
              className="inline-flex items-center gap-1 rounded-full border border-[#e9e5df] bg-white px-2.5 py-1 font-mono text-[10px] font-semibold"
            >
              <Check className="size-3 text-emerald-600" />
              {skill}
            </span>
          ))}
        </div>
      </div>
    </div>
  );
}
