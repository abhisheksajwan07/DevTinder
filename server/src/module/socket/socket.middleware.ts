import { Socket } from "socket.io";
import * as cookie from "cookie";
import jwt from "jsonwebtoken";

import { verifyAccessToken } from "../../utils/jwt.js";
import { AccessTokenPayload } from "../../types/jwt.types.js";
import { repository } from "../onboarding/onboarding.dependencies.js";

export async function socketAuthMiddleware(
  socket: Socket,
  next: (err?: Error) => void,
) {
  const cookieHeader = socket.handshake.headers.cookie ?? "";
  if (!cookieHeader) return next(new Error("UNAUTHORIZED"));
  const cookies = cookie.parseCookie(cookieHeader);
  const accessToken = cookies["accessToken"];
  if (!accessToken) return next(new Error("UNAUTHORIZED"));

  try {
    const payload = verifyAccessToken(accessToken) as AccessTokenPayload;
    // TODO(Security):
    // Validate sessionId to ensure revoked/expired sessions
    // cannot establish or keep Socket.IO connections.
    const profileId = await repository.getProfileId(payload.sub);

    if (!profileId) return next(new Error("PROFILE_NOT_FOUND"));
    socket.data = {
      userId: payload.sub,
      sessionId: payload.sessionId,
      profileId,
    };

    next();
  } catch (err) {
    if (err instanceof jwt.TokenExpiredError) {
      return next(new Error("TOKEN_EXPIRED"));
    }
    return next(new Error("INVALID_TOKEN"));
  }
}
