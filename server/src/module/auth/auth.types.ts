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
    profileId: string | null;
    hasEmailCredentials: boolean;
    isVerified: boolean | null;
    passwordHash: string | null;
    loginAttempts: number | null;
    lockedUntil: Date | null;
  } | null>;

  findUserById(userId: string): Promise<{
    id: string;
    email: string;
    onBoardingComplete: boolean;
    profileId: string | null;
  } | null>;

  createUser(data: CreateUserRepoDTO): Promise<typeof users.$inferSelect>;

  markEmailVerified(userId: string): Promise<void>;

  updateLoginAttempts(
    userId: string,
    data: {
      loginAttempts: number;
      lockedUntil: Date | null;
    },
  ): Promise<void>;

  updatePasswordHash(userId: string, passwordHash: string): Promise<void>;
  
}
