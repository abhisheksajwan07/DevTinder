import { db } from "../../db/drizzle.js";
import { sessions } from "../../db/schema/sessions.schema.js";
import { and, eq, gt } from "drizzle-orm";
import {
  CreateSessionDto,
  ISessionRepository,
  Session,
} from "./session.types.js";

export class SessionRepository implements ISessionRepository {
  async createSession(dto: CreateSessionDto): Promise<{ id: string }> {
    const [session] = await db
      .insert(sessions)
      .values({
        userId: dto.userId,
        refreshTokenHash: dto.refreshTokenHash,
        userAgent: dto.userAgent,
        ipAddress: dto.ipAddress,
        expiresAt: dto.expiresAt,
      })
      .returning({ id: sessions.id });

    return session!;
  }

  async findSessionById(sessionId: string): Promise<Session | null> {
    const session = await db.query.sessions.findFirst({
      where: eq(sessions.id, sessionId),
    });

    return session ?? null;
  }

  async revokeSession(sessionId: string): Promise<void> {
    await db
      .update(sessions)
      .set({
        isRevoked: true,
        revokedAt: new Date(),
      })
      .where(eq(sessions.id, sessionId));
  }
  async revokeAllSessionsByUserId(userId: string): Promise<void> {
    await db
      .update(sessions)
      .set({
        isRevoked: true,
        revokedAt: new Date(),
      })
      .where(eq(sessions.userId, userId));
  }

  async getActiveSessionsByUserId(userId: string): Promise<Session[]> {
    return db.query.sessions.findMany({
      where: (table, { and, eq, gt }) =>
        and(
          eq(table.userId, userId),
          eq(table.isRevoked, false),
          gt(table.expiresAt, new Date()),
        ),
      orderBy: (table, { desc }) => [desc(table.lastUsedAt)],
    });
  }

  async findSessionByTokenHash(hash: string): Promise<Session | null> {
    const session = await db.query.sessions.findFirst({
      where: (table, { eq }) => eq(table.refreshTokenHash, hash),
    });

    return session ?? null;
  }

  async updateSession(
    sessionId: string,
    dto: { refreshTokenHash: string; expiresAt: Date },
  ): Promise<void> {
    await db
      .update(sessions)
      .set({
        refreshTokenHash: dto.refreshTokenHash,
        expiresAt: dto.expiresAt,
        lastUsedAt: new Date(),
      })
      .where(eq(sessions.id, sessionId));
  }
}
