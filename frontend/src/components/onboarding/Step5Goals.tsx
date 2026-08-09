import { collabGoals, type CollabGoal } from "../../app/mock-data";
import { Check } from "lucide-react";

interface Step5Props {
  selectedGoals: CollabGoal[];
  toggleGoal: (goal: CollabGoal) => void;
  projectDescription: string;
  setProjectDescription: (val: string) => void;
}

export default function Step5Goals({
  selectedGoals,
  toggleGoal,
  projectDescription,
  setProjectDescription,
}: Step5Props) {
  return (
    <div className="mt-7">
      <h1 className="font-serif text-3xl font-normal text-[#1a1918] leading-tight">
        What are you looking for?
      </h1>
      <p className="mt-2 text-sm text-[#77736e]">
        Choose what kind of collaboration matters most to you.
      </p>

      <div className="mt-5 grid grid-cols-1 sm:grid-cols-2 gap-2.5">
        {collabGoals.map((goal) => (
          <button
            key={goal}
            type="button"
            onClick={() => toggleGoal(goal)}
            className={`flex items-center gap-3 rounded-2xl border px-4 py-3.5 text-sm font-medium text-left transition-all ${
              selectedGoals.includes(goal)
                ? "border-orange-500 bg-orange-50 text-orange-700"
                : "border-[#e9e5df] bg-white text-[#55504b] hover:border-orange-300"
            }`}
          >
            <span
              className={`grid size-5 shrink-0 place-items-center rounded-md border transition ${
                selectedGoals.includes(goal)
                  ? "border-orange-500 bg-orange-500 text-white"
                  : "border-[#c8c2b8]"
              }`}
            >
              {selectedGoals.includes(goal) && (
                <Check className="size-3 stroke-[3]" />
              )}
            </span>
            <span>{goal}</span>
          </button>
        ))}
      </div>

      <div className="mt-5">
        <label className="block font-mono text-[10px] font-bold uppercase tracking-wider text-[#77736e] mb-1.5">
          Project Description{" "}
          <span className="normal-case font-normal text-[#88827c]">(optional)</span>
        </label>
        <textarea
          value={projectDescription}
          onChange={(e) => setProjectDescription(e.target.value)}
          rows={3}
          placeholder="Briefly describe what you're building or what kind of project you want to start..."
          className="w-full rounded-2xl border border-[#e2ded6] bg-white px-4 py-3 text-sm text-[#242322] outline-none transition resize-none focus:border-orange-500 focus:ring-2 focus:ring-orange-500/20"
        />
      </div>

    </div>
  );
}
