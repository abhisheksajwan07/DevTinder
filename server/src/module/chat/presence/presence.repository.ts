import { Redis } from "ioredis";

export class PresenceRepository {
  constructor(private redis: Redis) { }

  private key(profileId: string): string {
    return `presence:${profileId}`;
  }

  async addSocket(profileId: string, socketId: string): Promise<number> {
    await this.redis.sadd(this.key(profileId), socketId);
    return this.redis.scard(this.key(profileId));
  }


  async removeSocket(profileId: string, socketId: string): Promise<number> {
    await this.redis.srem(this.key(profileId), socketId);
    return this.redis.scard(this.key(profileId));
  }
  async getSocketCount(profileId: string): Promise<number> {
    return this.redis.scard(this.key(profileId));
  }

  async getOnlineStatuses(
    profileIds: string[],
  ): Promise<Record<string, boolean>> {
    if (profileIds.length === 0) return {};
    const pipeline = this.redis.pipeline();
    profileIds.forEach((id) => {
      pipeline.scard(this.key(id));
    });
    const results = await pipeline.exec();
    const statuses: Record<string, boolean> = {};
    profileIds.forEach((id, index) => {
      const [error, value] = results?.[index] ?? [null, 0]
      // In ioredis, result is [error, value]

      statuses[id] = !error && Number(value) > 0
    });
    return statuses;
  }

  async clearAllPresenceKeys(): Promise<void> {
    let cursor = "0";
    do {
      const [newCursor, keys] = await this.redis.scan(
        cursor,
        "MATCH",
        "presence:*",
        "COUNT",
        "100",
      );
      cursor = newCursor;
      if (keys.length > 0) {
        await this.redis.del(...keys);
      }
    } while (cursor !== "0");
  }
}
