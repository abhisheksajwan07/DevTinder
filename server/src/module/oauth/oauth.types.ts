import { users, authAccounts, emailCredentials } from "../../db/drizzle.js";

export type OAuthProvider = "google" | "github";

export type User = typeof users.$inferSelect;
export type NewUser = typeof users.$inferInsert;

export type AuthAccount = typeof authAccounts.$inferSelect;
export type NewAuthAccount = typeof authAccounts.$inferInsert;

export type EmailCredential = typeof emailCredentials.$inferSelect;
export type NewEmailCredential = typeof emailCredentials.$inferInsert;

export interface GoogleUserInfo {
  id: string;
  email: string;
  name: string;
  picture: string;
  verifiedEmail: boolean;
}

export interface OAuthUserResult {
  user: User;
  isNewUser: boolean;
  providerProfile: GoogleUserInfo;
}

export interface CreateAuthAccountInput {
  userId: string;
  provider: OAuthProvider;
  providerAccountId: string;
  providerEmail: string;

  providerAccessToken?: string;

  providerRefreshToken?: string;

  providerTokenExpiresAt?: Date;
}

export interface OAuthRepositoryInterface {
  findAuthAccount(
    provider: OAuthProvider,
    providerAccountId: string,
  ): Promise<AuthAccount | null>;

  findUserByEmail(email: string): Promise<User | null>;

  findUserById(userId: string): Promise<User | null>;

  findEmailCredentialByUserId(userId: string): Promise<EmailCredential | null>;

  createUser(data: NewUser): Promise<User>;

  createAuthAccount(data: CreateAuthAccountInput): Promise<AuthAccount | null>;

  updateProviderTokens(
    authAccountId: string,
    data: {
      providerAccessToken?: string;
      providerRefreshToken?: string;
      providerTokenExpiresAt?: Date;
    },
  ): Promise<void>;

  updateLastUsedAt(authAccountId: string): Promise<void>;
}
