import { oauthEnv } from "../../../config/oauth.env.js";
import { OAuthProfile } from "../oauth.types.js";



// google's raw userinfo response shape
interface GoogleUserInfo {
  sub: string; // unique Google account id
  email: string;
  name: string;
  picture: string;
  email_verified: boolean;
}

interface GoogleTokenResponse {
  access_token: string;
  refresh_token?: string;
  expires_in: number;
  token_type: string;
}

// Scopes we request from Google
const SCOPES = ["openid", "email", "profile"].join(" ");

export class GoogleProvider {
  private readonly clientId = oauthEnv.GOOGLE_CLIENT_ID;
  private readonly clientSecret = oauthEnv.GOOGLE_CLIENT_SECRET;
  private readonly redirectUri = oauthEnv.GOOGLE_REDIRECT_URI;

  // the Google consent-screen url
  generateAuthUrl(state: string): string {
    const params = new URLSearchParams({
      client_id: this.clientId,
      redirect_uri: this.redirectUri,
      response_type: "code",
      scope: SCOPES,
      access_type: "offline", // request refresh_token
      prompt: "consent", // force consent so refresh_token is returned
      state, // CSRF protection verified in the callback
    });

    return `https://accounts.google.com/o/oauth2/v2/auth?${params.toString()}`;
  }

  
  async exchangeCodeForTokens(code: string): Promise<GoogleTokenResponse> {
    const res = await fetch("https://oauth2.googleapis.com/token", {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: new URLSearchParams({
        code,
        client_id: this.clientId,
        client_secret: this.clientSecret,
        redirect_uri: this.redirectUri,
        grant_type: "authorization_code",
      }),
    });

    if (!res.ok) {
      const error = await res.text();
      throw new Error(`Google token exchange failed: ${error}`);
    }

    return res.json() as Promise<GoogleTokenResponse>;
  }


  async getUserProfile(accessToken: string): Promise<OAuthProfile> {
    const res = await fetch("https://www.googleapis.com/oauth2/v3/userinfo", {
      headers: { Authorization: `Bearer ${accessToken}` },
    });

    if (!res.ok) {
      throw new Error("Failed to fetch Google user profile");
    }

    const google = (await res.json()) as GoogleUserInfo;

    
    return {
      id: google.sub, // providerAccountId
      email: google.email,
      name: google.name,
      avatar: google.picture,
      emailVerified: google.email_verified,
    };
  }
}


export const googleProvider = new GoogleProvider();
