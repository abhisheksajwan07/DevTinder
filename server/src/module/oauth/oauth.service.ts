import { AppError } from "../../utils/AppError.js";
import { ISessionService } from "../session/session.types.js";
import {
  IOAuthService,
  OAuthProfile,
  OAuthProvider,
  OAuthRepositoryInterface,
  OAuthUserResult,
} from "./oauth.types.js";

export class OAuthService implements IOAuthService {
  constructor(
    private readonly repository: OAuthRepositoryInterface,
    private readonly sessionService: ISessionService,
  ) {}

  async loginWithOAuth(
    provider: OAuthProvider,
    profile: OAuthProfile,
    providerTokens: {
      accessToken: string;
      refreshToken?: string;
      expiresIn: number;
    },
    meta: { userAgent?: string; ipAddress?: string },
  ): Promise<
    OAuthUserResult & { accessToken: string; rawRefreshToken: string }
  > {
    const tokenExpiresAt = new Date(
      Date.now() + providerTokens.expiresIn * 1000,
    );
    // step1 : is this oauth ever logged before?
    const existingAuthAccount = await this.repository.findAuthAccount(
      provider,
      profile.id, // providerAccountId — never changes even if email changes
    );

    if (existingAuthAccount) {
      const user = await this.repository.findUserById(
        existingAuthAccount.userId,
      );

      if (!user) {
        throw new AppError(
          "Linked user account not found. Please contact support.",
          500,
          "LINKED_USER_NOT_FOUND",
        );
      }

      await this.repository.updateProviderTokens(existingAuthAccount.id, {
        providerAccessToken: providerTokens.accessToken,
        providerRefreshToken: providerTokens.refreshToken,
        providerTokenExpiresAt: tokenExpiresAt,
      });

      const { accessToken, rawRefreshToken } =
        await this.sessionService.issueTokenPair(user.id, meta);

      return {
        user,
        isNewUser: false,
        accessToken,
        rawRefreshToken,
      };
    }

    // ── Step 2: OAuth never logged before, has  user with this email signed up  ?
    // because if a user has signup before using credentials,then the email will
    // be there in users
    const existingUser = await this.repository.findUserByEmail(profile.email);

    if (!existingUser) {
      // ── B: Brand-new user — create user + auth_account atomically
      const user = await this.repository.createOAuthUser(
        {
          email: profile.email,
        },
        
        {
          provider,
          providerAccountId: profile.id,
          providerEmail: profile.email,
          providerAccessToken: providerTokens.accessToken,
          providerRefreshToken: providerTokens.refreshToken,
          providerTokenExpiresAt: tokenExpiresAt,
        },
      );

      const { accessToken, rawRefreshToken } =
        await this.sessionService.issueTokenPair(user.id, meta);

      return { user, isNewUser: true, accessToken, rawRefreshToken };
    }

    //  C: user exists via credentials, link the new oauth provider ─
    //  only if their email address has been verified; otherwise someone
    // could bypass verification by logging in with a credentials first.
    const credential = await this.repository.findEmailCredentialByUserId(
      existingUser.id,
    );

    if (credential && !credential.isVerified) {
      throw new AppError(
        "Your email address is not verified. Please verify your email before linking a social login.",
        403,
        "EMAIL_NOT_VERIFIED",
      );
    }

    await this.repository.createOAuthAccount({
      userId: existingUser.id,
      provider,
      providerAccountId: profile.id,
      providerEmail: profile.email,
      providerAccessToken: providerTokens.accessToken,
      providerRefreshToken: providerTokens.refreshToken,
      providerTokenExpiresAt: tokenExpiresAt,
    });

    const { accessToken, rawRefreshToken } =
      await this.sessionService.issueTokenPair(existingUser.id, meta);

    return {
      user: existingUser,
      isNewUser: false,
      accessToken,
      rawRefreshToken,
    };
  }
}
