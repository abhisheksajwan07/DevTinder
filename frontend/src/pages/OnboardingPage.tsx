import { useState } from "react";
import { FormProvider, useForm } from "react-hook-form";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, ArrowRight, LoaderCircle, Sparkles } from "lucide-react";
import { zodResolver } from "@hookform/resolvers/zod";

import AuthShowcase from "../components/auth/AuthShowcase";
import ProgressBar from "../components/onboarding/ProgressBar";
import Step1BasicProfile from "../components/onboarding/Step1BasicProfile";
import Step2DeveloperIdentity from "../components/onboarding/Step2DeveloperIdentity";
import Step3Skills from "../components/onboarding/Step3Skills";
import Step4Interests from "../components/onboarding/Step4Interests";
import Step5Goals from "../components/onboarding/Step5Goals";
import Step6GithubConnection from "../components/onboarding/Step6GithubConnection";
import {
  useCreateOnboardingProfile,
  useOnboardingOptions,
  useUsernameAvailability,
} from "../hooks/onboarding.hooks";
import { useAuthStore } from "../stores/auth.store";
import {
  onboardingSchema,
  type OnboardingFormValues,
} from "../schemas/onboarding.schema";
import { ONBOARDING_DRAFT_STORAGE_KEY } from "../components/onboarding/Step6GithubConnection";

const TOTAL_STEPS = 6;

const stepFields: Record<number, (keyof OnboardingFormValues)[]> = {
  1: ["firstName", "lastName", "userName", "avatarId"],
  2: ["primaryRole", "experienceLevel", "availability"],
  3: ["skillIds"],
  4: ["interestIds"],
  5: ["lookingForIds"],
  6: [],
};

const emptyOnboardingValues: Record<keyof OnboardingFormValues, unknown> = {
  firstName: "",
  lastName: "",
  userName: "",
  bio: "",
  primaryRole: "",
  experienceLevel: "",
  availability: "",
  avatarId: "",
  projectDescription: "",
  skillIds: [],
  customSkills: [],
  interestIds: [],
  lookingForIds: [],
};

function getInitialOnboardingValues() {
  try {
    const draft = sessionStorage.getItem(ONBOARDING_DRAFT_STORAGE_KEY);
    return draft
      ? { ...emptyOnboardingValues, ...JSON.parse(draft) }
      : emptyOnboardingValues;
  } catch {
    return emptyOnboardingValues;
  }
}

export default function OnboardingPage() {
  const navigate = useNavigate();

  const [step, setStep] = useState(() => {
    const requestedStep = Number(
      new URLSearchParams(window.location.search).get("step"),
    );
    return requestedStep >= 1 && requestedStep <= TOTAL_STEPS
      ? requestedStep
      : 1;
  });
  const options = useOnboardingOptions();
  const createProfile = useCreateOnboardingProfile();
  const form = useForm<OnboardingFormValues>({
    mode: "onTouched",
    resolver: zodResolver(onboardingSchema),
    defaultValues: getInitialOnboardingValues(),
  });
  const username = form.watch("userName");
  const usernameQuery = useUsernameAvailability(username);

  const next = async () => {
    const fields = stepFields[step];
    const valid = await form.trigger(fields);

    // Username availability is a server-side check — can't be expressed in Zod
    if (step === 1 && valid) {
      if (usernameQuery.isFetching) {
        form.setError("userName", {
          message: "Checking username availability…",
        });
        return;
      }
      if (username.trim().length >= 3 && usernameQuery.data === false) {
        form.setError("userName", { message: "Choose an available username." });
        return;
      }
    }

    if (valid) setStep((current) => current + 1);
  };

  const complete = form.handleSubmit((values) =>
    createProfile.mutate(values, {
      onSuccess: () => {
        sessionStorage.removeItem(ONBOARDING_DRAFT_STORAGE_KEY);
        const user = useAuthStore.getState().user;
        if (user)
          useAuthStore
            .getState()
            .setUser({ ...user, onBoardingComplete: true });
        navigate("/app/discover", { replace: true });
      },
    }),
  );
  if (options.isLoading)
    return (
      <div className="grid min-h-screen place-items-center bg-[#f5f2eb] text-[#242322]">
        <div className="flex items-center gap-3 font-medium">
          <LoaderCircle className="size-5 animate-spin text-orange-500" />
          Loading profile options…
        </div>
      </div>
    );
  if (options.isError || !options.data)
    return (
      <div className="grid min-h-screen place-items-center bg-[#f5f2eb] p-6 text-center text-[#242322]">
        <div>
          <p className="font-semibold">We could not load onboarding options.</p>
          <button
            type="button"
            onClick={() => options.refetch()}
            className="mt-3 rounded-xl bg-[#1a1918] px-4 py-2 text-sm font-bold text-white"
          >
            Try again
          </button>
        </div>
      </div>
    );
  return (
    <div className="grid min-h-screen w-full grid-cols-1 bg-[#121212] lg:h-screen lg:grid-cols-[minmax(0,0.9fr)_minmax(0,1.1fr)]">
      <AuthShowcase />
      <div className="flex min-h-screen min-w-0 flex-col justify-between overflow-y-auto bg-[#f5f2eb] p-5 text-[#242322] sm:p-8 lg:h-screen lg:min-h-0 lg:p-10 xl:p-12">
        <div className="flex items-center justify-between border-b border-[#e4dfd6] pb-4 shrink-0">
          <div className="flex items-center gap-2">
            <div className="size-3 animate-pulse rounded-full bg-orange-500" />
            <span className="font-mono text-xs font-bold uppercase tracking-wider">
              DevTinder Onboarding
            </span>
          </div>
          <span className="font-mono text-[11px] text-[#77736e]">
            Step {step} of {TOTAL_STEPS} • Profile setup
          </span>
        </div>
        <div className="mx-auto my-auto w-full max-w-lg py-6">
          <div className="rounded-[28px] border border-[#e9e5df] bg-white p-6 shadow-xs sm:p-8">
            <ProgressBar step={step} totalSteps={TOTAL_STEPS} />
            <FormProvider {...form}>
              <div className="mt-6">
                {step === 1 && (
                  <Step1BasicProfile avatars={options.data.avatars} />
                )}{" "}
                {step === 2 && <Step2DeveloperIdentity />}{" "}
                {step === 3 && <Step3Skills skills={options.data.skills} />}{" "}
                {step === 4 && (
                  <Step4Interests interests={options.data.interests} />
                )}{" "}
                {step === 5 && (
                  <Step5Goals lookingFor={options.data.lookingFor} />
                )}{" "}
                {step === 6 && (
                  <Step6GithubConnection skills={options.data.skills} />
                )}
              </div>
            </FormProvider>
            <div className="mt-8 flex items-center justify-between gap-3">
              {step > 1 ? (
                <button
                  type="button"
                  onClick={() => setStep((current) => current - 1)}
                  className="inline-flex items-center gap-2 rounded-2xl border border-[#e2ded6] bg-white px-5 py-3 text-sm font-semibold text-[#55504b]"
                >
                  <ArrowLeft className="size-4" />
                  Back
                </button>
              ) : (
                <div />
              )}
              {step < TOTAL_STEPS ? (
                <button
                  type="button"
                  onClick={next}
                  className="inline-flex items-center gap-2 rounded-2xl bg-[#1a1918] px-6 py-3 text-sm font-bold text-white hover:bg-orange-600"
                >
                  Continue
                  <ArrowRight className="size-4" />
                </button>
              ) : (
                <button
                  type="button"
                  onClick={complete}
                  disabled={createProfile.isPending}
                  className="inline-flex items-center gap-2 rounded-2xl bg-[#ee7100] px-6 py-3 text-sm font-bold text-white shadow-md disabled:opacity-50"
                >
                  <Sparkles className="size-4" />
                  {createProfile.isPending
                    ? "Creating profile…"
                    : "Complete Profile"}
                </button>
              )}
            </div>
            {createProfile.isError && (
              <p className="mt-3 text-sm text-red-600">
                {(
                  createProfile.error as {
                    response?: { data?: { message?: string } };
                  }
                ).response?.data?.message ??
                  "Could not create your profile. Please try again."}
              </p>
            )}
          </div>
        </div>
        <p className="pt-4 text-center font-mono text-[10px] text-[#9c958e] shrink-0">
          DevTinder • Voyage AI Matcher • Your data is always under your control
        </p>
      </div>
    </div>
  );
}
