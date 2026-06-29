import { eq } from "drizzle-orm";

import { db } from "../../db/drizzle.js";
import { users, emailCredentials } from "../../db/drizzle.js";
import { CreateUserRepoDTO, IAuthRepository } from "./auth.types.js";
import { AppError } from "../../utils/AppError.js";

export class AuthRepository implements IAuthRepository {
  async findUserByEmail(email: string): Promise<{
    id: string;
    email: string;
    isVerified: boolean | null;
    passwordHash: string | null;
  } | null> {
    const result = await db
      .select({
        id: users.id,
        email: users.email,
        isVerified: emailCredentials.isVerified,
        passwordHash: emailCredentials.passwordHash,
      })
      .from(users)
      .leftJoin(emailCredentials, eq(emailCredentials.userId, users.id))
      .where(eq(users.email, email))
      .limit(1);

    return result[0] ?? null;
  }

  async createUser(
    data: CreateUserRepoDTO,
  ): Promise<typeof users.$inferSelect> {
    return await db.transaction(async (tx) => {
      const [insertedUser] = await tx
        .insert(users)
        .values({
          email: data.email,
        })
        .returning();
      if (!insertedUser) {
        throw new AppError(
          "User creation failed. Account may already exist.",
          409,
        );
      }

      await tx.insert(emailCredentials).values({
        userId: insertedUser?.id,
        passwordHash: data.passwordHash,
      });
      return insertedUser;
    });
  }

  async markEmailVerified(userId: string): Promise<void> {
    await db
      .update(emailCredentials)
      .set({ isVerified: true })
      .where(eq(emailCredentials.userId, userId));
  }
}
