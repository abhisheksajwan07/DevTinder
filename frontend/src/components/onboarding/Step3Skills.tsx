import { useMemo, useState } from "react";
import { X } from "lucide-react";
import { useFormContext, useWatch } from "react-hook-form";
import type { OnboardingOptions } from "../../services/onboarding.api";
import type { OnboardingFormValues } from "../../types/onboarding";

const MAX_TOTAL_SKILLS = 10;
const MAX_CUSTOM_SKILLS = 5;

export default function Step3Skills({
  skills,
}: Pick<OnboardingOptions, "skills">) {
  const [customSkillInput, setCustomSkillInput] = useState("");
  const {
    setValue,
    clearErrors,
    formState: { errors },
  } = useFormContext<OnboardingFormValues>();

  const watchedSkillIds = useWatch<OnboardingFormValues, "skillIds">({
    name: "skillIds",
  });
  const watchedCustomSkills = useWatch<OnboardingFormValues, "customSkills">({
    name: "customSkills",
  });

  const selectedSkillIds = watchedSkillIds ?? [];
  const customSkills = watchedCustomSkills ?? [];
  const totalSelectedSkillsCount = selectedSkillIds.length + customSkills.length;

  const selectedPresetSkills = useMemo(
    () => skills.filter((skill) => selectedSkillIds.includes(skill.id)),
    [skills, selectedSkillIds],
  );

  const skillsByCategory = useMemo(() => {
    return skills.reduce<Record<string, typeof skills>>((acc, skill) => {
      if (!acc[skill.category]) {
        acc[skill.category] = [];
      }
      acc[skill.category].push(skill);
      return acc;
    }, {});
  }, [skills]);

  const handleTogglePresetSkill = (skillId: string) => {
    const isAlreadySelected = selectedSkillIds.includes(skillId);
    let updatedSkillIds: string[];

    if (isAlreadySelected) {
      updatedSkillIds = selectedSkillIds.filter((id) => id !== skillId);
    } else if (totalSelectedSkillsCount < MAX_TOTAL_SKILLS) {
      updatedSkillIds = [...selectedSkillIds, skillId];
    } else {
      updatedSkillIds = selectedSkillIds;
    }

    setValue("skillIds", updatedSkillIds, { shouldValidate: true });
    if (updatedSkillIds.length + customSkills.length > 0) {
      clearErrors("skillIds");
    }
  };

  const handleRemoveCustomSkill = (skillNameToRemove: string) => {
    const updatedCustomSkills = customSkills.filter(
      (name) => name !== skillNameToRemove,
    );
    setValue("customSkills", updatedCustomSkills, { shouldValidate: true });
    if (selectedSkillIds.length + updatedCustomSkills.length > 0) {
      clearErrors("skillIds");
    }
  };

  const handleAddCustomSkill = () => {
    const trimmedInput = customSkillInput.trim();
    if (!trimmedInput) return;
    if (
      totalSelectedSkillsCount >= MAX_TOTAL_SKILLS ||
      customSkills.length >= MAX_CUSTOM_SKILLS
    ) {
      return;
    }

    const isDuplicateInPreset = selectedPresetSkills.some(
      (skill) => skill.name.toLowerCase() === trimmedInput.toLowerCase(),
    );
    const isDuplicateInCustom = customSkills.some(
      (name) => name.toLowerCase() === trimmedInput.toLowerCase(),
    );

    if (isDuplicateInPreset || isDuplicateInCustom) {
      return;
    }

    const updatedCustomSkills = [...customSkills, trimmedInput];
    setValue("customSkills", updatedCustomSkills, { shouldValidate: true });
    clearErrors("skillIds");
    setCustomSkillInput("");
  };

  return (
    <div className="mt-7">
      <h1 className="font-serif text-3xl font-normal leading-tight text-[#1a1918]">
        Your tech stack.
      </h1>
      <p className="mt-2 text-sm text-[#77736e]">
        Select up to {MAX_TOTAL_SKILLS} skills. This powers your AI match score.
      </p>

      {totalSelectedSkillsCount > 0 && (
        <div className="mt-4 flex flex-wrap gap-2">
          {selectedPresetSkills.map((skill) => (
            <span
              key={`preset-${skill.id}`}
              className="inline-flex items-center gap-1.5 rounded-full bg-[#1a1918] px-3 py-1.5 font-mono text-[11px] font-semibold text-white"
            >
              {skill.name}
              <button
                type="button"
                onClick={() => handleTogglePresetSkill(skill.id)}
              >
                <X className="size-3" />
              </button>
            </span>
          ))}

          {customSkills.map((customSkillName) => (
            <span
              key={`custom-${customSkillName}`}
              className="inline-flex items-center gap-1.5 rounded-full bg-[#1a1918] px-3 py-1.5 font-mono text-[11px] font-semibold text-white"
            >
              {customSkillName}
              <button
                type="button"
                onClick={() => handleRemoveCustomSkill(customSkillName)}
              >
                <X className="size-3" />
              </button>
            </span>
          ))}
        </div>
      )}

      <div className="mt-4 space-y-4">
        {Object.entries(skillsByCategory).map(([category, categorySkills]) => (
          <div key={category}>
            <p className="mb-2 font-mono text-[10px] font-bold uppercase tracking-wider text-[#88827c]">
              {category}
            </p>
            <div className="flex flex-wrap gap-2">
              {categorySkills.map((skill) => {
                const isSelected = selectedSkillIds.includes(skill.id);
                const isLimitReached =
                  totalSelectedSkillsCount >= MAX_TOTAL_SKILLS && !isSelected;

                return (
                  <button
                    key={skill.id}
                    type="button"
                    onClick={() => handleTogglePresetSkill(skill.id)}
                    disabled={isLimitReached}
                    className={`rounded-full border px-3 py-1.5 font-mono text-[11px] font-semibold transition-all ${
                      isSelected
                        ? "border-orange-500 bg-orange-50 text-orange-700"
                        : "border-[#e9e5df] bg-white text-[#55504b] hover:border-orange-300"
                    } ${isLimitReached ? "cursor-not-allowed opacity-40" : ""}`}
                  >
                    {skill.name}
                  </button>
                );
              })}
            </div>
          </div>
        ))}
      </div>

      <p className="mt-4 font-mono text-[11px] text-[#88827c]">
        {totalSelectedSkillsCount}/{MAX_TOTAL_SKILLS} selected
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
            value={customSkillInput}
            onChange={(event) => setCustomSkillInput(event.target.value)}
            onKeyDown={(event) => {
              if (event.key === "Enter") {
                event.preventDefault();
                handleAddCustomSkill();
              }
            }}
            maxLength={50}
            placeholder="e.g. WebSockets"
            className="min-w-0 flex-1 rounded-xl border border-[#e2ded6] bg-white px-3 py-2.5 text-sm outline-none focus:border-orange-500"
          />
          <button
            type="button"
            onClick={handleAddCustomSkill}
            disabled={!customSkillInput.trim() || totalSelectedSkillsCount >= MAX_TOTAL_SKILLS}
            className="rounded-xl bg-[#1a1918] px-4 py-2 text-xs font-bold text-white hover:bg-orange-600 disabled:opacity-40"
          >
            Add
          </button>
        </div>
        <p className="mt-2 text-[11px] text-[#88827c]">
          Up to {MAX_CUSTOM_SKILLS} custom skills; up to {MAX_TOTAL_SKILLS} total skills.
        </p>
      </div>
    </div>
  );
}
