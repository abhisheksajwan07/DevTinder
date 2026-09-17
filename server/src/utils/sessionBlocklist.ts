import { redis } from "../config/redis.js";

const BLOCKLIST_PREFIX = "blocklist:session:";


export async function blocklistSession(
  sessionId: string,
  ttlSeconds: number,
): Promise<void> {
  if (ttlSeconds <= 0) return; // token already expired — nothing to blocklist
  await redis.set(`${BLOCKLIST_PREFIX}${sessionId}`, "1", "EX", ttlSeconds);
}


export async function isSessionBlocklisted(sessionId: string): Promise<boolean> {
  const result = await redis.exists(`${BLOCKLIST_PREFIX}${sessionId}`);
  return result === 1;
}
