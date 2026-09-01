import { api } from "./api";
import type { OnboardingFormValues } from "../types/onboarding";

type ApiResponse<T> = { success: boolean; message: string; data: T };

export interface OnboardingOptions {
  skills: { id: string; name: string; category: string }[];
  interests: { id: string; name: string }[];
  lookingFor: { id: string; name: string }[];
  avatars: {
    id: string;

    displayName: string;

    imageUrl: string | null;
  }[];
}

export interface GitHubConnectionStatus { connected: boolean; }

export async function getOnboardingOptions(): Promise<OnboardingOptions> {
  const response = await api.get<ApiResponse<{ options: OnboardingOptions }>>("/onboarding/options");
  return response.data.data.options;
}

export async function checkUserName(username: string): Promise<boolean> {
  const response = await api.get<ApiResponse<{ available: boolean }>>("/onboarding/check-username", { params: { username } });
  return response.data.data.available;
}

export async function createOnboardingProfile(payload: OnboardingFormValues): Promise<void> {
  await api.post("/onboarding", payload);
}

export async function getGitHubConnectionStatus(): Promise<GitHubConnectionStatus> {
  const response = await api.get<ApiResponse<GitHubConnectionStatus>>("/github/status");
  return response.data.data;
}

