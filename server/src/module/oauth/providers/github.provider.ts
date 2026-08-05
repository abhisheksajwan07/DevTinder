import { oauthEnv } from "../../../config/oauth.env.js";
import { OAuthProfile } from "../oauth.types.js";

interface GithubUserInfo {
  id: number;
  login: string;
  name: string;
  avatar_url: string;
  email: string | null;
}

interface GitHubEmail {
  email: string;
  primary: boolean;
  verified: boolean;
  visibility: "public" | "private" | null;
}

interface GitHubTokenResponse {
  access_token: string;
  token_type: string;
  scope: string;
  refresh_token?: string; 
  expires_in?: number;
}
const SCOPES = ["read:user", "user:email"].join(" ");

export class GithubProvider {
  private readonly githubClientId = oauthEnv.GITHUB_CLIENT_ID;
  private readonly githubClientSecret = oauthEnv.GITHUB_CLIENT_SECRET;
  private readonly redirectUri = oauthEnv.GITHUB_REDIRECT_URI;
  private readonly connectRedirectUri =
    oauthEnv.GITHUB_CONNECT_REDIRECT_URI ??
    this.redirectUri.replace(/\/github\/callback$/, "/github/connect/callback");

  generateAuthUrl(state: string, redirectUri = this.redirectUri): string {
    const params = new URLSearchParams({
      client_id: this.githubClientId,
      redirect_uri: redirectUri,
      scope: SCOPES,
      state, // CSRF protection
    });
    return `https://github.com/login/oauth/authorize?${params.toString()}`;
  }

  async exchangeCodeForTokens(
    code: string,
    redirectUri = this.redirectUri,
  ): Promise<GitHubTokenResponse> {
    const res = await fetch("https://github.com/login/oauth/access_token", {
      method: "POST",
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
        Accept: "application/json", // Important: GitHub returns HTML/QueryString by default unless specified
      },
      body: new URLSearchParams({
        code,
        client_id: this.githubClientId,
        client_secret: this.githubClientSecret,
        redirect_uri: redirectUri,
      }),
    });

    if (!res.ok) {
      const error = await res.text();
      throw new Error(`GitHub token exchange failed: ${error}`);
    }

    return res.json() as Promise<GitHubTokenResponse>;
  }

  getConnectRedirectUri(): string {
    return this.connectRedirectUri;
  }

  async getUserProfile(accessToken: string): Promise<OAuthProfile> {
    const userRes = await fetch("https://api.github.com/user", {
      headers: {
        Authorization: `Bearer ${accessToken}`,
        Accept: "application/vnd.github+json",
      },
    });
    if (!userRes.ok) {
      throw new Error("Failed to fetch GitHub user profile");
    }

    const github = (await userRes.json()) as GithubUserInfo;

    const emailRes = await fetch("https://api.github.com/user/emails", {
      headers: {
        Authorization: `Bearer ${accessToken}`,
        Accept: "application/vnd.github+json",
      },
    });

    if (!emailRes.ok) {
      throw new Error("Failed to fetch GitHub emails");
    }

    const emails = (await emailRes.json()) as GitHubEmail[];

    const selectedEmail = emails.find((e) => e.primary && e.verified);

    if (!selectedEmail) {
      throw new Error("No verified primary email found");
    }

    return {
      id: github.id.toString(),
      email: selectedEmail.email,
      name: github.name ?? github.login,
      avatar: github.avatar_url,
      emailVerified: true,
      githubLogin: github.login, // raw GitHub username e.g. "abhishek"
    };
  }
}
export const githubProvider = new GithubProvider();
