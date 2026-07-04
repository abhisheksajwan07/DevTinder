import * as crypto from "crypto";
import {
  ISessionRepository,
  ISessionService,
  SessionResponse,
} from "./session.types.js";
import { signAccessToken } from "../../utils/jwt.js";
import { parseUserAgent } from "../../utils/parseUserAgent.js";
import { parseIp } from "../../utils/parseIp.js";
import { AppError } from "../../utils/AppError.js";
import { SESSION_EXPIRY_DAYS } from "../../utils/constants.js";

export class SessionService implements ISessionService {
  constructor(private sessionRepository: ISessionRepository) {}

  async issueTokenPair(
    userId: string,
    meta: {
      userAgent?: string;
      ipAddress?: string;
    },
  ): Promise<{ accessToken: string; rawRefreshToken: string }> {
    const rawRefreshToken = crypto.randomBytes(64).toString("hex");
    const refreshTokenHash = crypto
      .createHash("sha256")
      .update(rawRefreshToken)
      .digest("hex");

    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + 7);

    const session = await this.sessionRepository.createSession({
      userId,
      refreshTokenHash,
      userAgent: meta.userAgent,
      ipAddress: meta.ipAddress,
      expiresAt,
    });
    const accessToken = signAccessToken({
      sub: userId,
      sessionId: session.id,
    });

    return {
      accessToken,
      rawRefreshToken,
    };
  }

  async getActiveSessions(
    userId: string,
    currentSessionId: string,
  ): Promise<SessionResponse[]> {
    const sessions =
      await this.sessionRepository.getActiveSessionsByUserId(userId);

    return sessions.map((session) => {
      const userAgent = parseUserAgent(session.userAgent ?? undefined);
      const location = parseIp(session.ipAddress ?? undefined);

      return {
        id: session.id,
        browser: userAgent?.browser ?? null,
        os: userAgent?.os ?? null,
        deviceType: userAgent?.deviceType ?? null,

        city: location?.city ?? null,
        country: location?.country ?? null,

        createdAt: session.createdAt,
        lastUsedAt: session.lastUsedAt,
        isCurrent: session.id === currentSessionId,
      };
    });
  }

  async refreshSession(
    rawRefreshToken: string,
  ): Promise<{ accessToken: string; rawRefreshToken: string }> {
    const refreshTokenHash = crypto
      .createHash("sha256")
      .update(rawRefreshToken)
      .digest("hex");
    const session =
      await this.sessionRepository.findSessionByTokenHash(refreshTokenHash);

    if (!session) {
      throw new AppError("invalid refresh token", 401);
    }
    if (session.isRevoked) {
      throw new AppError("Session revoked", 401);
    }
    if (session.expiresAt < new Date()) {
      throw new AppError("Refresh token expired", 401);
    }

    const newRawRefreshToken = crypto.randomBytes(64).toString("hex");

    const newRefreshTokenHash = crypto
      .createHash("sha256")
      .update(newRawRefreshToken)
      .digest("hex");

    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + SESSION_EXPIRY_DAYS);
    await this.sessionRepository.updateSession(session.id, {
      refreshTokenHash: newRefreshTokenHash,
      expiresAt,
    });

    const accessToken = signAccessToken({
      sub: session.userId,
      sessionId: session.id,
    });
    return {
      accessToken,
      rawRefreshToken: newRawRefreshToken,
    };
  }

  async revokeSession(sessionId: string): Promise<void> {
    await this.sessionRepository.revokeSession(sessionId);
  }

  async revokeAllSessionsByUserId(userId: string): Promise<void> {
    await this.sessionRepository.revokeAllSessionsByUserId(userId);
  }

  async revokeOtherSessions(
    userId: string,
    currentSessionId: string,
  ): Promise<void> {
    await this.sessionRepository.revokeOtherSessions(userId, currentSessionId);
  }
}
