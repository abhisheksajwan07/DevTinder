import { avatarOptions } from "../../app/mock-data";
import { Check, X } from "lucide-react";

interface Step1Props {
  selectedAvatar: string;
  setSelectedAvatar: (av: string) => void;
  bio: string;
  setBio: (bio: string) => void;
  firstName: string;
  setFirstName: (fn: string) => void;
  lastName: string;
  setLastName: (ln: string) => void;
  username: string;
  handleUsernameChange: (val: string) => void;
  usernameAvailable: boolean | null;
}

export default function Step1BasicProfile({
  selectedAvatar,
  setSelectedAvatar,
  bio,
  setBio,
  firstName,
  setFirstName,
  lastName,
  setLastName,
  username,
  handleUsernameChange,
  usernameAvailable,
}: Step1Props) {
  return (
    <div className="mt-7">
      <h1 className="font-serif text-3xl font-normal text-[#1a1918] leading-tight">
        Set up your profile.
      </h1>
      <p className="mt-2 text-sm text-[#77736e]">
        Your identity on DevTinder. Developers will see this first.
      </p>

      {/* Avatar Grid */}
      <div className="mt-6">
        <label className="block font-mono text-[10px] font-bold uppercase tracking-wider text-[#77736e] mb-3">
          Choose Avatar
        </label>
        <div className="grid grid-cols-4 gap-2.5">
          {avatarOptions.map((av) => (
            <button
              key={av}
              type="button"
              onClick={() => setSelectedAvatar(av)}
              className={`h-14 rounded-2xl grid place-items-center font-bold text-sm transition-all ${
                selectedAvatar === av
                  ? "bg-[#1a1918] text-white ring-2 ring-[#1a1918] ring-offset-2 scale-105"
                  : "bg-[#f7f5f2] text-[#55504b] border border-[#e9e5df] hover:border-orange-300"
              }`}
            >
              {av}
            </button>
          ))}
        </div>
      </div>

      <div className="mt-4">
        <label className="block font-mono text-[10px] font-bold uppercase tracking-wider text-[#77736e] mb-1.5">
          Bio <span className="normal-case font-normal text-[#88827c]">(optional)</span>
        </label>
        <textarea
          value={bio}
          onChange={(e) => setBio(e.target.value)}
          maxLength={500}
          rows={3}
          placeholder="Tell developers what you like building..."
          className="w-full rounded-2xl border border-[#e2ded6] bg-white px-4 py-3 text-sm text-[#242322] outline-none transition resize-none focus:border-orange-500 focus:ring-2 focus:ring-orange-500/20"
        />
        <p className="mt-1 text-right font-mono text-[10px] text-[#88827c]">
          {bio.length}/500
        </p>
      </div>

      <div className="mt-5 grid grid-cols-2 gap-4">
        <div>
          <label className="block font-mono text-[10px] font-bold uppercase tracking-wider text-[#77736e] mb-1.5">
            First Name
          </label>
          <input
            value={firstName}
            onChange={(e) => setFirstName(e.target.value)}
            placeholder="Arjun"
            className="w-full rounded-2xl border border-[#e2ded6] bg-white px-4 py-3 text-sm text-[#242322] outline-none transition focus:border-orange-500 focus:ring-2 focus:ring-orange-500/20"
          />
        </div>
        <div>
          <label className="block font-mono text-[10px] font-bold uppercase tracking-wider text-[#77736e] mb-1.5">
            Last Name
          </label>
          <input
            value={lastName}
            onChange={(e) => setLastName(e.target.value)}
            placeholder="Mehta"
            className="w-full rounded-2xl border border-[#e2ded6] bg-white px-4 py-3 text-sm text-[#242322] outline-none transition focus:border-orange-500 focus:ring-2 focus:ring-orange-500/20"
          />
        </div>
      </div>

      <div className="mt-4">
        <label className="block font-mono text-[10px] font-bold uppercase tracking-wider text-[#77736e] mb-1.5">
          Username
        </label>
        <div className="relative">
          <span className="absolute left-4 top-1/2 -translate-y-1/2 font-mono text-sm text-[#88827c]">
            @
          </span>
          <input
            value={username}
            onChange={(e) => handleUsernameChange(e.target.value)}
            placeholder="yourhandle"
            className={`w-full rounded-2xl border bg-white pl-8 pr-10 py-3 text-sm text-[#242322] outline-none transition ${
              usernameAvailable === true
                ? "border-emerald-400 focus:ring-2 focus:ring-emerald-400/20"
                : usernameAvailable === false
                ? "border-red-400 focus:ring-2 focus:ring-red-400/20"
                : "border-[#e2ded6] focus:border-orange-500 focus:ring-2 focus:ring-orange-500/20"
            }`}
          />
          {usernameAvailable !== null && (
            <span className="absolute right-3 top-1/2 -translate-y-1/2">
              {usernameAvailable ? (
                <Check className="size-4 text-emerald-500" />
              ) : (
                <X className="size-4 text-red-400" />
              )}
            </span>
          )}
        </div>
        {usernameAvailable === true && (
          <p className="mt-1 font-mono text-[11px] text-emerald-600">
            ✓ Username available
          </p>
        )}
        {usernameAvailable === false && (
          <p className="mt-1 font-mono text-[11px] text-red-500">
            ✗ Username taken — try another
          </p>
        )}
      </div>
    </div>
  );
}
