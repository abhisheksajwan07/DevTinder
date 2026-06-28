import bcrypt from "bcrypt";
import { env } from "../config/env.js";

const saltRounds = Number(env.SALT_ROUNDS);

export const hashPassword = async (password: string) => {
  return await bcrypt.hash(password, saltRounds); // Promise<string> return
};

export const comparePassword = async (
  password: string,
  hashPassword: string,
) => {
  return await bcrypt.compare(password, hashPassword);
};
