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

export type SessionResponse = {
  id: string;
  browser: string | null;
  os: string | null;
  deviceType: string | null;
  city: string | null;
  country: string | null;
 
  lastUsedAt: Date | null;
  createdAt: Date;
  isCurrent: boolean;
};

export interface ISessionRepository {
  createSession(dto: CreateSessionDto): Promise<{ id: string }>;
  findSessionById(sessionId: string): Promise<Session | null>;
  
  revokeSession(sessionId: string): Promise<void>;
  revokeAllSessionsByUserId(userId: string): Promise<void>;
  getActiveSessionsByUserId(userId: string): Promise<Session[]>;
}

export interface ISessionService {
  issueTokenPair(
    userId: string,
    meta: { userAgent?: string; ipAddress?: string },
  ): Promise<{ accessToken: string; rawRefreshToken: string }>;

  getActiveSessions(
    userId: string,
    currentSessionId: string,
  ): Promise<SessionResponse[]>;
}
