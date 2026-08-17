import { Check } from "lucide-react";
import { useFormContext, useWatch } from "react-hook-form";
import type { OnboardingOptions } from "../../services/onboarding.api";
import type { OnboardingFormValues } from "../../types/onboarding";

export default function Step5Goals({
  lookingFor,
}: Pick<OnboardingOptions, "lookingFor">) {
  const {
    setValue,
    register,
    formState: { errors },
  } = useFormContext<OnboardingFormValues>();
  const ids =
    useWatch<OnboardingFormValues, "lookingForIds">({
      name: "lookingForIds",
    }) ?? [];
  const toggle = (id: string) =>
    setValue(
      "lookingForIds",
      ids.includes(id)
        ? ids.filter((item) => item !== id)
        : ids.length < 5
          ? [...ids, id]
          : ids,
      { shouldValidate: true },
    );
  return (
    <div className="mt-7">
      <h1 className="font-serif text-3xl font-normal leading-tight text-[#1a1918]">
        What are you looking for?
      </h1>
      <p className="mt-2 text-sm text-[#77736e]">
        Choose what kind of collaboration matters most to you.
      </p>
      <div className="mt-5 grid grid-cols-1 gap-2.5 sm:grid-cols-2">
        {lookingFor.map((goal) => (
          <button
            key={goal.id}
            type="button"
            onClick={() => toggle(goal.id)}
            className={`flex items-center gap-3 rounded-2xl border px-4 py-3.5 text-left text-sm font-medium transition-all ${ids.includes(goal.id) ? "border-orange-500 bg-orange-50 text-orange-700" : "border-[#e9e5df] bg-white text-[#55504b] hover:border-orange-300"}`}
          >
            <span
              className={`grid size-5 place-items-center rounded-md border ${ids.includes(goal.id) ? "border-orange-500 bg-orange-500 text-white" : "border-[#c8c2b8]"}`}
            >
              {ids.includes(goal.id) && <Check className="size-3 stroke-[3]" />}
            </span>
            {goal.name}
          </button>
        ))}
      </div>
      {errors.lookingForIds && (
        <p className="mt-3 text-xs text-red-500">
          {errors.lookingForIds.message}
        </p>
      )}
      <div className="mt-5">
        <label className="mb-1.5 block font-mono text-[10px] font-bold uppercase tracking-wider text-[#77736e]">
          Project description{" "}
          <span className="normal-case font-normal text-[#88827c]">
            (optional)
          </span>
        </label>
        <textarea
          {...register("projectDescription")}
          rows={3}
          placeholder="Briefly describe what you're building..."
          className="w-full resize-none rounded-2xl border border-[#e2ded6] bg-white px-4 py-3 text-sm outline-none focus:border-orange-500"
        />
        {errors.projectDescription && (
          <p className="mt-1 text-xs text-red-500">
            {errors.projectDescription.message}
          </p>
        )}
      </div>
    </div>
  );
}
