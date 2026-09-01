import { useFormContext, useWatch } from "react-hook-form";
import type { OnboardingOptions } from "../../services/onboarding.api";
import type { OnboardingFormValues } from "../../types/onboarding";

export default function Step4Interests({ interests }: Pick<OnboardingOptions, "interests">) {
  const { setValue, formState: { errors } } = useFormContext<OnboardingFormValues>();
  const ids = useWatch<OnboardingFormValues, "interestIds">({ name: "interestIds" }) ?? [];
  const toggle = (id: string) => setValue("interestIds", ids.includes(id) ? ids.filter((item) => item !== id) : ids.length < 10 ? [...ids, id] : ids, { shouldValidate: true });
  return <div className="mt-7"><h1 className="font-serif text-3xl font-normal leading-tight text-[#1a1918]">What excites you?</h1><p className="mt-2 text-sm text-[#77736e]">Choose areas you want to work in. This filters your developer feed.</p><div className="mt-6 flex flex-wrap gap-2.5">{interests.map((interest) => <button key={interest.id} type="button" onClick={() => toggle(interest.id)} className={`rounded-2xl border px-4 py-2.5 text-xs font-semibold transition-all ${ids.includes(interest.id) ? "border-orange-500 bg-orange-50 text-orange-700" : "border-[#e9e5df] bg-white text-[#55504b] hover:border-orange-300"}`}>{interest.name}</button>)}</div>{errors.interestIds && <p className="mt-3 text-xs text-red-500">{errors.interestIds.message}</p>}</div>;
}
