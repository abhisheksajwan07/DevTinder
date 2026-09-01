import { githubProfiles, githubRepositories } from "../../db/drizzle.js";

// -- DB row types --

export type GitHubProfile = typeof githubProfiles.$inferSelect;
export type NewGitHubProfile = typeof githubProfiles.$inferInsert;

export type GitHubRepository = typeof githubRepositories.$inferSelect;
export type NewGitHubRepository = typeof githubRepositories.$inferInsert;

// -- GitHub API response shapes --

export interface GitHubApiUser {
  id: number;
  login: string;
  avatar_url: string;
  bio: string | null;
  followers: number;
  public_repos: number;
}

export interface GitHubApiRepo {
  id: number;
  name: string;
  description: string | null;
  language: string | null;
  stargazers_count: number;
  html_url: string;
  updated_at: string;
  private: boolean;
  fork: boolean;
}

export interface GitHubApiTokenResponse {
  access_token: string;
  refresh_token?: string;
  expires_in?: number;
  refresh_token_expires_in?: number;
  token_type: string;
}

// --Auth account shape --

export interface GitHubAuthAccount {
  id: string;
  userId: string;
  providerAccessToken: string | null;
  providerRefreshToken: string | null;
  providerTokenExpiresAt: Date | null;
}

//-- Service-level shapes --
export interface GitHubProfileResponse {
  username: string;
  avatarUrl: string | null;
  bio: string | null;
  followers: number;
  publicRepos: number;
  lastSyncedAt: Date | null;
  repositories: GitHubRepositoryItem[];
}

export interface GitHubConnectionStatus {
  connected: boolean;
}

export interface GitHubRepositoryItem {
  id: string;
  githubRepoId: number;
  name: string;
  description: string | null;
  language: string | null;
  stars: number;
  htmlUrl: string;
  isFeatured: boolean;
}

// --Repository layer interface --

export interface IGitHubRepository {
  findGitHubAccount(profileId: string): Promise<GitHubAuthAccount | null>;
  getConnectionStatus(userId: string): Promise<GitHubConnectionStatus>;
  syncGitHubData(
    profileId: string,
    profile: UpsertGitHubProfileData,
    repos: SyncRepoItem[],
  ): Promise<void>;
  getProfile(profileId: string): Promise<GitHubProfile | null>;
  getRepositories(profileId: string): Promise<GitHubRepository[]>;
  setFeaturedRepositories(profileId: string, repoIds: string[]): Promise<void>;
}

// -- Repository-layer input types --

export interface UpsertGitHubProfileData {
  githubId: string;
  username: string;
  avatarUrl: string;
  bio: string | null;
  followers: number;
  publicRepos: number;
  lastSyncedAt: Date;
}

export interface SyncRepoItem {
  githubRepoId: number;
  name: string;
  description: string | null;
  language: string | null;
  stars: number;
  htmlUrl: string;
  repoUpdatedAt: Date;
}
