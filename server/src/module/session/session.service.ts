import * as crypto from "crypto";
import { ISessionRepository } from "./session.types.js";
import { signAccessToken } from "../../utils/jwt.js";

export class SessionService {
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
}
