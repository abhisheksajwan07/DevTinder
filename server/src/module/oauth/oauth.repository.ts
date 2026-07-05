import { db, emailCredentials } from "../../db/drizzle.js";
import { authAccounts } from "../../db/drizzle.js";
import { users } from "../../db/drizzle.js";
import { eq, and } from "drizzle-orm";
import {
  AuthAccount,
  CreateAuthAccountInput,
  EmailCredential,
  NewUser,
  OAuthProvider,
  OAuthRepositoryInterface,
  User,
} from "./oauth.types.js";

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
  async findUserByEmail(email: string): Promise<User | null> {
    const [user] = await db.select().from(users).where(eq(users.email, email));

    return user ?? null;
  }
  async createUser(data: NewUser): Promise<User> {
    const [user] = await db.insert(users).values(data).returning();
    if (!user) throw new Error("Failed to create user");
    return user;
  }

  async createAuthAccount(
    data: CreateAuthAccountInput,
  ): Promise<AuthAccount | null> {
    const [res] = await db.insert(authAccounts).values(data).returning();
    return res ?? null;
  }

  async findUserById(userId: string): Promise<User | null> {
    const [user] = await db.select().from(users).where(eq(users.id, userId));
    return user ?? null;
  }

  async findEmailCredentialByUserId(
    userId: string,
  ): Promise<EmailCredential | null> {
    const [email] = await db
      .select()
      .from(emailCredentials)
      .where(eq(emailCredentials.userId, userId));

    return email ?? null;
  }

  async updateProviderTokens(
    authAccountId: string,
    data: {
      providerAccessToken?: string;
      providerRefreshToken?: string;
      providerTokenExpiresAt?: Date;
    },
  ): Promise<void> {
    await db
      .update(authAccounts)
      .set(data)
      .where(eq(authAccounts.id, authAccountId));
  }

  async updateLastUsedAt(authAccountId: string): Promise<void> {
    await db
      .update(authAccounts)
      .set({
        lastUsedAt: new Date(),
      })
      .where(eq(authAccounts.id, authAccountId));
  }
}
