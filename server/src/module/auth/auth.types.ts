import { users, emailCredentials } from "../../db/drizzle.js";

export type CreateUserRepoDTO = {
  email: string;
  passwordHash: string;
};

export interface IAuthRepository {
  findUserByEmail(email: string): Promise<{
    id: string;
    email: string;
    onBoardingComplete: boolean;
    isVerified: boolean | null;
    passwordHash: string | null;
    loginAttempts: number | null;
    lockedUntil: Date | null;
  } | null>;

  createUser(data: CreateUserRepoDTO): Promise<typeof users.$inferSelect>;

  markEmailVerified(userId: string): Promise<void>;

  updateLoginAttempts(
    userId: string,
    data: {
      loginAttempts: number;
      lockedUntil: Date | null;
    },
  ):Promise<void>;
}
