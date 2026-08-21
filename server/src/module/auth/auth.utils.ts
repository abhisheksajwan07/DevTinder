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
  // Invalidate any previously issued (still-live) token for this user
  const existingHash = await redis.get(`reset:user:${userId}`);
  if (existingHash) {
    await redis.del(`reset:${existingHash}`);
  }

  // Bidirectional mapping so we can look up in both directions
  await redis.set(`reset:${tokenHash}`, userId, "EX", RESET_TOKEN_TTL);
  await redis.set(`reset:user:${userId}`, tokenHash, "EX", RESET_TOKEN_TTL);
};

export const getResetTokenUserId = async (tokenHash: string) => {
  return await redis.get(`reset:${tokenHash}`);
};

export const deleteResetToken = async (tokenHash: string) => {
  const userId = await redis.get(`reset:${tokenHash}`);
  if (userId) {
    // Clean up both the token→user and user→token entries atomically
    await redis.del(`reset:${tokenHash}`, `reset:user:${userId}`);
  } else {
    await redis.del(`reset:${tokenHash}`);
  }
};
