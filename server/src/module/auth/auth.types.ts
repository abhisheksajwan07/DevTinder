import { users, emailCredentials } from "../../db/drizzle.js";

export type CreateUserRepoDTO = {
  email: string;
  passwordHash: string;
};

export interface IAuthRepository {
  findUserByEmail(email: string): Promise<typeof users.$inferSelect | null>;
  createUser(
    data: CreateUserRepoDTO,
  ): Promise<typeof users.$inferSelect>;
}
