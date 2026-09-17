import crypto from "crypto";
import { env } from "../config/env.js";

const ALGORITHM = "aes-256-gcm";
const KEY = Buffer.from(env.OAUTH_TOKEN_ENCRYPTION_KEY, "hex");

export function encryptOAuthToken(plaintext: string): string {
  if (!plaintext) return plaintext;
  const iv = crypto.randomBytes(12);
  const cipher = crypto.createCipheriv(ALGORITHM, KEY, iv);
  const encrypted = Buffer.concat([
    cipher.update(plaintext, "utf8"),
    cipher.final(),
  ]);
  const tag = cipher.getAuthTag();
  return `${iv.toString("hex")}:${tag.toString("hex")}:${encrypted.toString("hex")}`;
}

export function decryptOAuthToken(ciphertext: string): string {
  if (!ciphertext) return ciphertext;
  const parts = ciphertext.split(":");
  if (parts.length !== 3) {
    return ciphertext;
  }
  const [ivHex, tagHex, dataHex] = parts;
  if (!ivHex || !tagHex || !dataHex) {
    return ciphertext;
  }
  try {
    const iv = Buffer.from(ivHex, "hex");
    const tag = Buffer.from(tagHex, "hex");
    const decipher = crypto.createDecipheriv(ALGORITHM, KEY, iv);
    decipher.setAuthTag(tag);
    return decipher.update(dataHex, "hex", "utf8") + decipher.final("utf8");
  } catch {
    return ciphertext;
  }
}
