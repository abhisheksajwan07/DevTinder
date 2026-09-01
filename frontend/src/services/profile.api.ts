import { api } from "./api";
import type { PublicProfile } from "../types/profile";

type ApiResponse<T> = { data: T };

export async function getMyProfile(): Promise<PublicProfile> {
  const response = await api.get<ApiResponse<{ profile: PublicProfile }>>("/onboarding/me");
  return response.data.data.profile;
}

export async function getPublicProfile(username: string): Promise<PublicProfile> {
  const response = await api.get<ApiResponse<{ profile: PublicProfile }>>(`/profiles/${encodeURIComponent(username)}`);
  return response.data.data.profile;
}

export type UpdateProfileInput = Partial<Pick<PublicProfile, "bio" | "primaryRole" | "experienceLevel" | "availability" | "projectDescription">> & {
  skillIds?: string[];
  customSkills?: string[];
  interestIds?: string[];
  lookingForIds?: string[];
};

export async function updateMyProfile(input: UpdateProfileInput): Promise<void> {
  await api.patch("/onboarding/me", input);
}
