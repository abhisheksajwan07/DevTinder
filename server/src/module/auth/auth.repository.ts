import { eq } from "drizzle-orm";

import { db } from "../../db/drizzle.js";
import { users, emailCredentials } from "../../db/drizzle.js";
import { CreateUserRepoDTO, IAuthRepository } from "./auth.types.js";
import { AppError } from "../../utils/AppError.js";

export class AuthRepository implements IAuthRepository {
  async findUserByEmail(
    email: string,
  ): Promise<typeof users.$inferSelect | null> {
    const result = await db.select().from(users).where(eq(users.email, email));
    return result[0] || null;
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
}
