
import { AppError } from "../../utils/AppError.js";

import type {
  GitHubApiUser,
  GitHubApiRepo,
 
  GitHubAuthAccount,
} from "./github.types.js";


export class GitHubApiClient {
  private readonly baseUrl = "https://api.github.com";

  /**
   * Returns a valid access token.
   */
  async getValidAccessToken(account: GitHubAuthAccount): Promise<string> {
    if (!account.providerAccessToken) {
      throw new AppError(
        "No GitHub access token found. Please recooenct your Github account",
        401,
        "GITHUB_TOKEN_MISSING",
      );
    }

    return account.providerAccessToken;
  }

  async getProfile(accessToken: string): Promise<GitHubApiUser> {
    const res = await fetch(`${this.baseUrl}/user`, {
      headers: {
        Authorization: `Bearer ${accessToken}`,
        Accept: "application/vnd.github+json",
        "X-GitHub-Api-Version": "2022-11-28",
      },
    });

    if (!res.ok) {
      throw new AppError(
        `GitHub /user request failed: ${res.status}`,
        502,
        "GITHUB_API_ERROR",
      );
    }

    return res.json() as Promise<GitHubApiUser>;
  }

  async getRepositories(accessToken: string): Promise<GitHubApiRepo[]> {
  
    const res = await fetch(
      `${this.baseUrl}/user/repos?type=public&sort=pushed&per_page=100`,
      {
        headers: {
          Authorization: `Bearer ${accessToken}`,
          Accept: "application/vnd.github+json",
          "X-GitHub-Api-Version": "2022-11-28",
        },
      },
    );

    if (!res.ok) {
      throw new AppError(
        `GitHub /user/repos request failed: ${res.status}`,
        502,
        "GITHUB_API_ERROR",
      );
    }

    const repos = (await res.json()) as GitHubApiRepo[];
    // Only public, original repositories strengthen a developer profile.
    return repos.filter((r) => !r.private && !r.fork);
  }
}

export const githubApiClient = new GitHubApiClient();
