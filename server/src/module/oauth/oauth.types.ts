import { users, authAccounts, emailCredentials } from "../../db/drizzle.js";

export type OAuthProvider = "google" | "github";

export type User = typeof users.$inferSelect;
export type NewUser = typeof users.$inferInsert;

export type AuthAccount = typeof authAccounts.$inferSelect;

export type EmailCredential = typeof emailCredentials.$inferSelect;

export interface OAuthProfile {
  id: string; //  (Google sub / GitHub id)
  email: string;
  name: string;
  avatar?: string;
  emailVerified: boolean;
}

export interface OAuthUserResult {
  user: User;
  isNewUser: boolean;
}

export interface CreateOAuthAccountInput {
  userId: string;
  provider: OAuthProvider;
  providerAccountId: string;
  providerEmail: string;

  providerAccessToken?: string;
  providerRefreshToken?: string;
  providerTokenExpiresAt?: Date;
}

export type CreateOAuthAccountInputWithoutUserId = Omit<
  CreateOAuthAccountInput,
  "userId"
>;

export interface ProviderTokenUpdate {
  providerAccessToken?: string;
  providerRefreshToken?: string;
  providerTokenExpiresAt?: Date;
}

export interface OAuthRepositoryInterface {
  findAuthAccount(
    provider: OAuthProvider,
    providerAccountId: string,
  ): Promise<AuthAccount | null>;

  findUserById(userId: string): Promise<User | null>;

  findUserByEmail(email: string): Promise<User | null>;

  findEmailCredentialByUserId(userId: string): Promise<EmailCredential | null>;

  createOAuthUser(
    data: NewUser,
    account: CreateOAuthAccountInputWithoutUserId ,
  ): Promise<User>;

  createOAuthAccount(data: CreateOAuthAccountInput): Promise<AuthAccount>;

  updateProviderTokens(
    authAccountId: string,
    data: ProviderTokenUpdate,
  ): Promise<void>;
}

export interface IOAuthService {
  loginWithOAuth(
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
  >;
}
