import { skillsByCategory } from "../../app/mock-data";
import { X } from "lucide-react";

interface Step3Props {
  selectedSkills: string[];
  toggleSkill: (skill: string) => void;
  customSkills: string[];
  removeCustomSkill: (skill: string) => void;
  customSkillInput: string;
  setCustomSkillInput: (val: string) => void;
  addCustomSkill: () => void;
}

export default function Step3Skills({
  selectedSkills,
  toggleSkill,
  customSkills,
  removeCustomSkill,
  customSkillInput,
  setCustomSkillInput,
  addCustomSkill,
}: Step3Props) {
  const totalSkills = selectedSkills.length + customSkills.length;

  return (
    <div className="mt-7">
      <h1 className="font-serif text-3xl font-normal text-[#1a1918] leading-tight">
        Your tech stack.
      </h1>
      <p className="mt-2 text-sm text-[#77736e]">
        Select up to 10 skills. This powers your AI match score.
      </p>

      {/* Selected chips */}
      {totalSkills > 0 && (
        <div className="mt-4 flex flex-wrap gap-2">
          {[...selectedSkills, ...customSkills].map((skill) => (
            <span
              key={skill}
              className="inline-flex items-center gap-1.5 rounded-full bg-[#1a1918] px-3 py-1.5 font-mono text-[11px] font-semibold text-white"
            >
              {skill}
              <button
                type="button"
                onClick={() =>
                  selectedSkills.includes(skill)
                    ? toggleSkill(skill)
                    : removeCustomSkill(skill)
                }
                className="hover:text-orange-300 transition"
              >
                <X className="size-3" />
              </button>
            </span>
          ))}
        </div>
      )}

      <div className="mt-4 space-y-4">
        {Object.entries(skillsByCategory).map(([category, skills]) => (
          <div key={category}>
            <p className="font-mono text-[10px] font-bold uppercase tracking-wider text-[#88827c] mb-2">
              {category}
            </p>
            <div className="flex flex-wrap gap-2">
              {skills.map((skill) => (
                <button
                  key={skill}
                  type="button"
                  onClick={() => toggleSkill(skill)}
                  className={`rounded-full border px-3 py-1.5 font-mono text-[11px] font-semibold transition-all ${
                    selectedSkills.includes(skill)
                      ? "border-orange-500 bg-orange-50 text-orange-700"
                      : "border-[#e9e5df] bg-white text-[#55504b] hover:border-orange-300"
                  } ${
                    totalSkills >= 10 && !selectedSkills.includes(skill)
                      ? "opacity-40 cursor-not-allowed"
                      : ""
                  }`}
                  disabled={totalSkills >= 10 && !selectedSkills.includes(skill)}
                >
                  {skill}
                </button>
              ))}
            </div>
          </div>
        ))}
      </div>

      <p className="mt-4 font-mono text-[11px] text-[#88827c]">
        {totalSkills}/10 selected
      </p>

      <div className="mt-5 rounded-2xl border border-dashed border-[#d4cec6] bg-[#faf8f5] p-4">
        <label className="mb-2 block font-mono text-[10px] font-bold uppercase tracking-wider text-[#77736e]">
          Add a custom skill
        </label>
        <div className="flex gap-2">
          <input
            value={customSkillInput}
            onChange={(e) => setCustomSkillInput(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                e.preventDefault();
                addCustomSkill();
              }
            }}
            placeholder="e.g. WebSockets"
            maxLength={50}
            className="min-w-0 flex-1 rounded-xl border border-[#e2ded6] bg-white px-3 py-2.5 text-sm text-[#242322] outline-none focus:border-orange-500 focus:ring-2 focus:ring-orange-500/20"
          />
          <button
            type="button"
            onClick={addCustomSkill}
            disabled={!customSkillInput.trim() || totalSkills >= 10}
            className="rounded-xl bg-[#1a1918] px-4 py-2 text-xs font-bold text-white hover:bg-orange-600 disabled:cursor-not-allowed disabled:opacity-40"
          >
            Add
          </button>
        </div>
        <p className="mt-2 text-[11px] text-[#88827c]">
          Custom skills are sent in the backend&apos;s <code>customSkills</code> array.
        </p>
      </div>
    </div>
  );
}
