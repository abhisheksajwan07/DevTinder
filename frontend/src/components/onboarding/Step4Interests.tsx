import { interestOptions } from "../../app/mock-data";

interface Step4Props {
  selectedInterests: string[];
  toggleInterest: (interest: string) => void;
}

export default function Step4Interests({
  selectedInterests,
  toggleInterest,
}: Step4Props) {
  return (
    <div className="mt-7">
      <h1 className="font-serif text-3xl font-normal text-[#1a1918] leading-tight">
        What excites you?
      </h1>
      <p className="mt-2 text-sm text-[#77736e]">
        Choose areas you want to work in. This filters your developer feed.
      </p>

      <div className="mt-6 flex flex-wrap gap-2.5">
        {interestOptions.map((interest) => (
          <button
            key={interest}
            type="button"
            onClick={() => toggleInterest(interest)}
            className={`rounded-2xl border px-4 py-2.5 text-xs font-semibold transition-all ${
              selectedInterests.includes(interest)
                ? "border-orange-500 bg-orange-50 text-orange-700"
                : "border-[#e9e5df] bg-white text-[#55504b] hover:border-orange-300"
            }`}
          >
            {interest}
          </button>
        ))}
      </div>
    </div>
  );
}
