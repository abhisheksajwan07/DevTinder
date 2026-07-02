import * as crypto from "crypto";

import { redis } from "../../config/redis.js";

const RESET_TOKEN_TTL = 15 * 60;

export const generateResetToken = () => {
  return crypto.randomBytes(32).toString("hex");
};

export const hashResetToken = (token: string) => {
  return crypto.createHash("sha256").update(token).digest("hex");
};

export const storeResetToken = async (tokenHash: string, userId: string) => {
  await redis.set(`reset:${tokenHash}`, userId, "EX", RESET_TOKEN_TTL);
};

export const getResetTokenUserId = async (tokenHash: string) => {
  return await redis.get(`reset:${tokenHash}`);
};

export const deleteResetToken = async (tokenHash: string) => {
  await redis.del(`reset:${tokenHash}`);
};
