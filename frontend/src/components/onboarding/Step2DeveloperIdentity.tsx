import { roles, experienceLevels, availabilityOptions, type Role, type Experience, type Availability } from "../../app/mock-data";

interface Step2Props {
  selectedRole: Role | null;
  setSelectedRole: (role: Role) => void;
  selectedExp: Experience | null;
  setSelectedExp: (exp: Experience) => void;
  selectedAvailability: Availability | null;
  setSelectedAvailability: (av: Availability) => void;
}

export default function Step2DeveloperIdentity({
  selectedRole,
  setSelectedRole,
  selectedExp,
  setSelectedExp,
  selectedAvailability,
  setSelectedAvailability,
}: Step2Props) {
  return (
    <div className="mt-7">
      <h1 className="font-serif text-3xl font-normal text-[#1a1918] leading-tight">
        Your developer identity.
      </h1>
      <p className="mt-2 text-sm text-[#77736e]">
        Tell us how you build — we'll find developers with complementary styles.
      </p>

      <div className="mt-6">
        <label className="block font-mono text-[10px] font-bold uppercase tracking-wider text-[#77736e] mb-3">
          Primary Role
        </label>
        <div className="grid grid-cols-3 gap-2">
          {roles.map((role) => (
            <button
              key={role}
              type="button"
              onClick={() => setSelectedRole(role)}
              className={`rounded-2xl border px-3 py-2.5 text-xs font-semibold text-left transition-all ${
                selectedRole === role
                  ? "border-orange-500 bg-orange-50 text-orange-700"
                  : "border-[#e9e5df] bg-white text-[#55504b] hover:border-orange-300"
              }`}
            >
              {role}
            </button>
          ))}
        </div>
      </div>

      <div className="mt-5">
        <label className="block font-mono text-[10px] font-bold uppercase tracking-wider text-[#77736e] mb-3">
          Experience Level
        </label>
        <div className="grid grid-cols-4 gap-2">
          {experienceLevels.map((level) => (
            <button
              key={level}
              type="button"
              onClick={() => setSelectedExp(level)}
              className={`rounded-2xl border px-3 py-3 text-xs font-semibold text-center transition-all ${
                selectedExp === level
                  ? "border-orange-500 bg-orange-50 text-orange-700"
                  : "border-[#e9e5df] bg-white text-[#55504b] hover:border-orange-300"
              }`}
            >
              {level}
            </button>
          ))}
        </div>
      </div>

      <div className="mt-5">
        <label className="block font-mono text-[10px] font-bold uppercase tracking-wider text-[#77736e] mb-3">
          Weekly Availability
        </label>
        <div className="grid grid-cols-2 gap-2">
          {availabilityOptions.map((av) => (
            <button
              key={av}
              type="button"
              onClick={() => setSelectedAvailability(av)}
              className={`rounded-2xl border px-4 py-3 text-xs font-semibold text-left transition-all ${
                selectedAvailability === av
                  ? "border-orange-500 bg-orange-50 text-orange-700"
                  : "border-[#e9e5df] bg-white text-[#55504b] hover:border-orange-300"
              }`}
            >
              {av}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
