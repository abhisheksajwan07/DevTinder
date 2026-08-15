import { Check, LoaderCircle, X } from "lucide-react";
import { useFormContext, useWatch } from "react-hook-form";
import { useUsernameAvailability } from "../../hooks/onboarding.hooks";
import type { OnboardingOptions } from "../../services/onboarding.api";
import type { OnboardingFormValues } from "../../types/onboarding";

export default function Step1BasicProfile({
  avatars,
}: Pick<OnboardingOptions, "avatars">) {
  const {
    register,
    setValue,
    formState: { errors },
  } = useFormContext<OnboardingFormValues>();
  const avatarId = useWatch<OnboardingFormValues, "avatarId">({
    name: "avatarId",
  });
  const bio = useWatch<OnboardingFormValues, "bio">({ name: "bio" });
  const username = useWatch<OnboardingFormValues, "userName">({
    name: "userName",
  });
  const usernameQuery = useUsernameAvailability(username ?? "");
  const validUsername =
    (username ?? "").trim().length >= 3 &&
    /^[a-zA-Z0-9_]+$/.test((username ?? "").trim());
  const usernameAvailable = usernameQuery.data;
  const usernameChecked =
    validUsername &&
    !usernameQuery.isFetching &&
    !usernameQuery.isError &&
    typeof usernameAvailable === "boolean";

  return (
    
    <div className="mt-7">
      <h1 className="font-serif text-3xl font-normal leading-tight text-[#1a1918]">
        Set up your profile.
      </h1>
      <p className="mt-2 text-sm text-[#77736e]">
        Your identity on DevTinder. Developers will see this first.
      </p>
      <div className="mt-6">
        <label className="mb-3 block font-mono text-[10px] font-bold uppercase tracking-wider text-[#77736e]">
          Choose avatar
        </label>
        <div className="grid grid-cols-3 gap-2.5 sm:grid-cols-4">
          {avatars.map((avatar) => (
            <button
              key={avatar.id}
              type="button"
              onClick={() =>
                setValue("avatarId", avatar.id, { shouldValidate: true })
              }
              className={`h-20 rounded-2xl grid place-items-center gap-0.5 font-bold text-sm transition-all ${avatarId === avatar.id ? "bg-[#1a1918] text-white ring-2 ring-[#1a1918] ring-offset-2 scale-105" : "bg-[#f7f5f2] text-[#55504b] border border-[#e9e5df] hover:border-orange-300"}`}
            >
              {avatar.imageUrl ? (
                <img
                  src={avatar.imageUrl}
                  alt={avatar.displayName}
                  className="size-10 rounded-xl object-cover"
                />
              ) : (
                <span className="grid size-10 place-items-center rounded-xl bg-orange-100 text-orange-700">
                  {avatar.displayName[0]}
                </span>
              )}
              <span className="text-[10px] leading-none">
                {avatar.displayName}
              </span>
            </button>
          ))}
        </div>
        {errors.avatarId && (
          <p className="mt-2 text-xs text-red-500">{errors.avatarId.message}</p>
        )}
      </div>
      <div className="mt-4">
        <label className="mb-1.5 block font-mono text-[10px] font-bold uppercase tracking-wider text-[#77736e]">
          Bio{" "}
          <span className="normal-case font-normal text-[#88827c]">
            (optional)
          </span>
        </label>
        <textarea
          {...register("bio", {
            maxLength: {
              value: 500,
              message: "Bio can be at most 500 characters.",
            },
          })}
          maxLength={500}
          rows={3}
          placeholder="Tell developers what you like building..."
          className="w-full resize-none rounded-2xl border border-[#e2ded6] bg-white px-4 py-3 text-sm text-[#242322] outline-none transition focus:border-orange-500 focus:ring-2 focus:ring-orange-500/20"
        />
        <p className="mt-1 text-right font-mono text-[10px] text-[#88827c]">
          {(bio ?? "").length}/500
        </p>
      </div>
      <div className="mt-5 grid grid-cols-2 gap-4">
        <label className="block font-mono text-[10px] font-bold uppercase tracking-wider text-[#77736e]">
          First name
          <input
            {...register("firstName", {
              required: "First name is required.",
              maxLength: 100,
            })}
            placeholder="Arjun"
            className="mt-1.5 w-full rounded-2xl border border-[#e2ded6] bg-white px-4 py-3 text-sm normal-case text-[#242322] outline-none focus:border-orange-500 focus:ring-2 focus:ring-orange-500/20"
          />
        </label>
        <label className="block font-mono text-[10px] font-bold uppercase tracking-wider text-[#77736e]">
          Last name
          <input
            {...register("lastName", {
              required: "Last name is required.",
              maxLength: 100,
            })}
            placeholder="Mehta"
            className="mt-1.5 w-full rounded-2xl border border-[#e2ded6] bg-white px-4 py-3 text-sm normal-case text-[#242322] outline-none focus:border-orange-500 focus:ring-2 focus:ring-orange-500/20"
          />
        </label>
      </div>
      {(errors.firstName || errors.lastName) && (
        <p className="mt-2 text-xs text-red-500">
          {errors.firstName?.message ?? errors.lastName?.message}
        </p>
      )}
      <div className="mt-4">
        <label className="mb-1.5 block font-mono text-[10px] font-bold uppercase tracking-wider text-[#77736e]">
          Username
        </label>
        <div className="relative">
          <span className="absolute left-4 top-1/2 -translate-y-1/2 font-mono text-sm text-[#88827c]">
            @
          </span>
          <input
            {...register("userName", {
              required: "Username is required.",
              minLength: {
                value: 3,
                message: "Username must have at least 3 characters.",
              },
              maxLength: 30,
              pattern: {
                value: /^[a-zA-Z0-9_]+$/,
                message: "Use letters, numbers, and underscores only.",
              },
            })}
            placeholder="yourhandle"
            className={`w-full rounded-2xl border bg-white py-3 pl-8 pr-10 text-sm text-[#242322] outline-none transition ${usernameAvailable === true ? "border-emerald-400" : usernameAvailable === false ? "border-red-400" : "border-[#e2ded6] focus:border-orange-500"}`}
          />
          {validUsername && (
            <span className="absolute right-3 top-1/2 -translate-y-1/2">
              {usernameQuery.isFetching ? (
                <LoaderCircle className="size-4 animate-spin text-[#88827c]" />
              ) : usernameChecked && usernameAvailable ? (
                <Check className="size-4 text-emerald-500" />
              ) : usernameChecked ? (
                <X className="size-4 text-red-400" />
              ) : null}
            </span>
          )}
        </div>
        {errors.userName ? (
          <p className="mt-1 text-xs text-red-500">{errors.userName.message}</p>
        ) : usernameQuery.isError ? (
          <p className="mt-1 text-xs text-red-500">
            Could not check this username. Try again.
          </p>
        ) : (
          usernameChecked && (
            <p
              className={`mt-1 font-mono text-[11px] ${usernameAvailable ? "text-emerald-600" : "text-red-500"}`}
            >
              {usernameAvailable
                ? "Username available"
                : "Username taken — try another"}
            </p>
          )
        )}
      </div>
    </div>
  );
}
