import { api } from "./api";

export type GitHubRepository = {
  id: string;
  name: string;
  description: string | null;
  language: string | null;
  stars: number;
  htmlUrl: string;
  isFeatured: boolean;
};

export type GitHubProfile = {
  username: string;
  lastSyncedAt: string | null;
  repositories: GitHubRepository[];
};

type ApiResponse<T> = { data: T };

export async function getGitHubProfile(): Promise<GitHubProfile> {
  const response = await api.get<ApiResponse<{ github: GitHubProfile }>>("/github/profile");
  return response.data.data.github;
}

export async function syncGitHub(): Promise<void> {
  await api.post("/github/sync");
}
