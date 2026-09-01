import {
  db,
  users,
  authAccounts,
  emailCredentials,
  profiles,
} from "../../db/drizzle.js";

import { eq, and } from "drizzle-orm";

import {
  AuthAccount,
  CreateOAuthAccountInput,
  CreateOAuthAccountInputWithoutUserId,
  EmailCredential,
  NewUser,
  OAuthProvider,
  OAuthRepositoryInterface,
  ProviderTokenUpdate,
  User,
} from "./oauth.types.js";

import { AppError } from "../../utils/AppError.js";

export class OAuthRepository implements OAuthRepositoryInterface {
  async findAuthAccount(
    provider: OAuthProvider,
    providerAccountId: string,
  ): Promise<AuthAccount | null> {
    const [account] = await db
      .select()
      .from(authAccounts)
      .where(
        and(
          eq(authAccounts.provider, provider),
          eq(authAccounts.providerAccountId, providerAccountId),
        ),
      );

    return account ?? null;
  }

  async findUserById(userId: string): Promise<User | null> {
    const [user] = await db.select().from(users).where(eq(users.id, userId));

    return user ?? null;
  }

  async findUserByEmail(email: string): Promise<User | null> {
    const [user] = await db.select().from(users).where(eq(users.email, email));

    return user ?? null;
  }

  async findEmailCredentialByUserId(
    userId: string,
  ): Promise<EmailCredential | null> {
    const [credential] = await db
      .select()
      .from(emailCredentials)
      .where(eq(emailCredentials.userId, userId));

    return credential ?? null;
  }

  async createOAuthAccount(
    data: CreateOAuthAccountInput,
  ): Promise<AuthAccount> {
    const [account] = await db.insert(authAccounts).values(data).returning();

    if (!account) {
      throw new AppError("Failed to create OAuth account", 500);
    }

    return account;
  }

  async updateProviderTokens(
    authAccountId: string,
    data: ProviderTokenUpdate,
  ): Promise<void> {
    await db
      .update(authAccounts)
      .set(data)
      .where(eq(authAccounts.id, authAccountId));
  }

  async findProfileIdByUserId(userId: string): Promise<string | null> {
    const [profile] = await db
      .select({ id: profiles.id })
      .from(profiles)
      .where(eq(profiles.userId, userId))
      .limit(1);

    return profile?.id ?? null;
  }

  async createOAuthUser(
    data: NewUser,
    account: CreateOAuthAccountInputWithoutUserId,
  ): Promise<User> {
    return db.transaction(async (tx) => {
      const [user] = await tx.insert(users).values(data).returning();

      if (!user) {
        throw new AppError("Failed to create user", 500);
      }

      const [authAccount] = await tx
        .insert(authAccounts)
        .values({
          ...account,
          userId: user.id,
        })
        .returning();

      if (!authAccount) {
        throw new AppError("Failed to create OAuth account", 500);
      }

      return user;
    });
  }
}
