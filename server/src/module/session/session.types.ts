export interface CreateSessionDto {
  userId: string;
  refreshTokenHash: string;
  userAgent?: string;
  ipAddress?: string;
  expiresAt: Date;
}

export type Session = {
  id: string;
  userId: string;
  refreshTokenHash: string;
  userAgent: string | null;
  ipAddress: string | null;
  expiresAt: Date;
  createdAt: Date;
  lastUsedAt: Date | null;
  isRevoked: boolean;
  revokedAt: Date | null;
};

export interface ISessionRepository {
  createSession(dto: CreateSessionDto): Promise<{ id: string }>;
  findSessionById(sessionId: string): Promise<Session | null>;
  revokeSession(sessionId: string): Promise<void>;
  revokeAllSessionsByUserId(userId: string): Promise<void>;
}

export interface ISessionService {
  issueTokenPair(
    userId: string,
    meta: { userAgent?: string; ipAddress?: string },
  ): Promise<{ accessToken: string; rawRefreshToken: string }>;
}
