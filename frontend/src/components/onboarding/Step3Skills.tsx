import { useState } from "react";
import { X } from "lucide-react";
import { useFormContext, useWatch } from "react-hook-form";
import type { OnboardingOptions } from "../../services/onboarding.api";
import type { OnboardingFormValues } from "../../types/onboarding";

export default function Step3Skills({
  skills,
}: Pick<OnboardingOptions, "skills">) {
  const [input, setInput] = useState("");
  const {
    setValue,
    clearErrors,
    formState: { errors },
  } = useFormContext<OnboardingFormValues>();
  const selectedIds = useWatch<OnboardingFormValues, "skillIds">({
    name: "skillIds",
  });
  const customSkills = useWatch<OnboardingFormValues, "customSkills">({
    name: "customSkills",
  });
  const ids = selectedIds ?? [];
  const custom = customSkills ?? [];
  const total = ids.length + custom.length;
  const selected = skills.filter((skill) => ids.includes(skill.id));
  const grouped = skills.reduce<Record<string, typeof skills>>(
    (groups, skill) => ({
      ...groups,
      [skill.category]: [...(groups[skill.category] ?? []), skill],
    }),
    {},
  );
  const toggle = (id: string) => {
    const nextIds = ids.includes(id)
      ? ids.filter((item) => item !== id)
      : total < 10
        ? [...ids, id]
        : ids;
    setValue("skillIds", nextIds, { shouldValidate: true });
    if (nextIds.length + custom.length > 0) clearErrors("skillIds");
  };
  const addCustom = () => {
    const value = input.trim();
    if (
      !value ||
      total >= 10 ||
      custom.length >= 5 ||
      [...selected.map((skill) => skill.name), ...custom].some(
        (item) => item.toLowerCase() === value.toLowerCase(),
      )
    )
      return;
    setValue("customSkills", [...custom, value], { shouldValidate: true });
    clearErrors("skillIds");
    setInput("");
  };
  return (
    <div className="mt-7">
      <h1 className="font-serif text-3xl font-normal leading-tight text-[#1a1918]">
        Your tech stack.
      </h1>
      <p className="mt-2 text-sm text-[#77736e]">
        Select up to 10 skills. This powers your AI match score.
      </p>
      {total > 0 && (
        <div className="mt-4 flex flex-wrap gap-2">
          {[
            ...selected.map((skill) => ({
              id: skill.id,
              name: skill.name,
              preset: true,
            })),
            ...custom.map((name) => ({ id: name, name, preset: false })),
          ].map((skill) => (
            <span
              key={skill.id}
              className="inline-flex items-center gap-1.5 rounded-full bg-[#1a1918] px-3 py-1.5 font-mono text-[11px] font-semibold text-white"
            >
              {skill.name}
              <button
                type="button"
                onClick={() =>
                  skill.preset
                    ? toggle(skill.id)
                    : setValue(
                        "customSkills",
                        custom.filter((item) => item !== skill.name),
                        { shouldValidate: true },
                      )
                }
              >
                <X className="size-3" />
              </button>
            </span>
          ))}
        </div>
      )}
      <div className="mt-4 space-y-4">
        {Object.entries(grouped).map(([category, items]) => (
          <div key={category}>
            <p className="mb-2 font-mono text-[10px] font-bold uppercase tracking-wider text-[#88827c]">
              {category}
            </p>
            <div className="flex flex-wrap gap-2">
              {items.map((skill) => (
                <button
                  key={skill.id}
                  type="button"
                  onClick={() => toggle(skill.id)}
                  disabled={total >= 10 && !ids.includes(skill.id)}
                  className={`rounded-full border px-3 py-1.5 font-mono text-[11px] font-semibold transition-all ${ids.includes(skill.id) ? "border-orange-500 bg-orange-50 text-orange-700" : "border-[#e9e5df] bg-white text-[#55504b] hover:border-orange-300"} ${total >= 10 && !ids.includes(skill.id) ? "cursor-not-allowed opacity-40" : ""}`}
                >
                  {skill.name}
                </button>
              ))}
            </div>
          </div>
        ))}
      </div>
      <p className="mt-4 font-mono text-[11px] text-[#88827c]">
        {total}/10 selected
      </p>
      {errors.skillIds && (
        <p className="mt-1 text-xs text-red-500">{errors.skillIds.message}</p>
      )}
      <div className="mt-5 rounded-2xl border border-dashed border-[#d4cec6] bg-[#faf8f5] p-4">
        <label className="mb-2 block font-mono text-[10px] font-bold uppercase tracking-wider text-[#77736e]">
          Add a custom skill
        </label>
        <div className="flex gap-2">
          <input
            value={input}
            onChange={(event) => setInput(event.target.value)}
            onKeyDown={(event) => {
              if (event.key === "Enter") {
                event.preventDefault();
                addCustom();
              }
            }}
            maxLength={50}
            placeholder="e.g. WebSockets"
            className="min-w-0 flex-1 rounded-xl border border-[#e2ded6] bg-white px-3 py-2.5 text-sm outline-none focus:border-orange-500"
          />
          <button
            type="button"
            onClick={addCustom}
            disabled={!input.trim() || total >= 10}
            className="rounded-xl bg-[#1a1918] px-4 py-2 text-xs font-bold text-white hover:bg-orange-600 disabled:opacity-40"
          >
            Add
          </button>
        </div>
        <p className="mt-2 text-[11px] text-[#88827c]">
          Up to 5 custom skills; up to 10 total skills.
        </p>
      </div>
    </div>
  );
}
