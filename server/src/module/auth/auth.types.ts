import { users, emailCredentials } from "../../db/drizzle.js";

export type CreateUserRepoDTO = {
  email: string;
  passwordHash: string;
};

export interface IAuthRepository {
  findUserByEmail(email: string): Promise<{
    id: string;
    email: string;
    isVerified: boolean | null;
    passwordHash: string | null;
  } | null>;

  createUser(data: CreateUserRepoDTO): Promise<typeof users.$inferSelect>;

  markEmailVerified(userId: string): Promise<void>;
}
