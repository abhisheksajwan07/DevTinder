import { useMutation, useQuery } from "@tanstack/react-query";
import {
  checkUserName,
  createOnboardingProfile,
  getGitHubConnectionStatus,
  getOnboardingOptions,
} from "../services/onboarding.api";
import { USERNAME_REGEX } from "../schemas/onboarding.schema";
import type { OnboardingFormValues } from "../types/onboarding";
import { useDebounce } from "./useDebounce";

export function useOnboardingOptions() {
  return useQuery({
    queryKey: ["onboarding", "options"],
    queryFn: getOnboardingOptions,
  });
}

export function useUsernameAvailability(username: string) {
  const value = useDebounce(username.trim(), 400);
  const valid = value.length >= 3 && USERNAME_REGEX.test(value);
  return useQuery({
    queryKey: ["onboarding", "username", value],
    queryFn: () => checkUserName(value),
    enabled: valid,
    retry: false,
  });
}

export function useCreateOnboardingProfile() {
  return useMutation({
    mutationFn: (payload: OnboardingFormValues) =>
      createOnboardingProfile(payload),
  });
}

export function useGitHubConnectionStatus() {
  return useQuery({
    queryKey: ["github", "status"],
    queryFn: getGitHubConnectionStatus,
    staleTime: 0,
  });
}
