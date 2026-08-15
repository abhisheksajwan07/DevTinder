import { useFormContext, useWatch } from "react-hook-form";
import {
  availabilityOptions,
  experienceOptions,
  roleOptions,
  type OnboardingFormValues,
} from "../../types/onboarding";

export default function Step2DeveloperIdentity() {
  const {
    setValue,
    formState: { errors },
  } = useFormContext<OnboardingFormValues>();
  const [role, experience, availability] = useWatch<OnboardingFormValues>({
    name: ["primaryRole", "experienceLevel", "availability"],
  });
  const button = (active: boolean) =>
    `rounded-2xl border px-3 py-2.5 text-xs font-semibold transition-all ${active ? "border-orange-500 bg-orange-50 text-orange-700" : "border-[#e9e5df] bg-white text-[#55504b] hover:border-orange-300"}`;
  return (
    <div className="mt-7">
      <h1 className="font-serif text-3xl font-normal leading-tight text-[#1a1918]">
        Your developer identity.
      </h1>
      <p className="mt-2 text-sm text-[#77736e]">
        Tell us how you build — we'll find developers with complementary styles.
      </p>
      <div className="mt-6">
        <label className="mb-3 block font-mono text-[10px] font-bold uppercase tracking-wider text-[#77736e]">
          Primary role
        </label>
        <div className="grid grid-cols-3 gap-2">
          {roleOptions.map((item) => (
            <button
              key={item.value}
              type="button"
              onClick={() =>
                setValue("primaryRole", item.value, { shouldValidate: true })
              }
              className={`${button(role === item.value)} text-left`}
            >
              {item.label}
            </button>
          ))}
        </div>
      </div>
      <div className="mt-5">
        <label className="mb-3 block font-mono text-[10px] font-bold uppercase tracking-wider text-[#77736e]">
          Experience level
        </label>
        <div className="grid grid-cols-4 gap-2">
          {experienceOptions.map((item) => (
            <button
              key={item}
              type="button"
              onClick={() =>
                setValue("experienceLevel", item, { shouldValidate: true })
              }
              className={`${button(experience === item)} text-center`}
            >
              {item}
            </button>
          ))}
        </div>
      </div>
      <div className="mt-5">
        <label className="mb-3 block font-mono text-[10px] font-bold uppercase tracking-wider text-[#77736e]">
          Weekly availability
        </label>
        <div className="grid grid-cols-2 gap-2">
          {availabilityOptions.map((item) => (
            <button
              key={item.value}
              type="button"
              onClick={() =>
                setValue("availability", item.value, { shouldValidate: true })
              }
              className={`${button(availability === item.value)} text-left`}
            >
              {item.label}
            </button>
          ))}
        </div>
      </div>
      {(errors.primaryRole ||
        errors.experienceLevel ||
        errors.availability) && (
        <p className="mt-3 text-xs text-red-500">
          {errors.primaryRole?.message ??
            errors.experienceLevel?.message ??
            errors.availability?.message}
        </p>
      )}
    </div>
  );
}
