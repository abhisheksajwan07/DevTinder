
import { JwtPayload } from "jsonwebtoken";

export interface AccessTokenPayload extends JwtPayload {
  sub: string;
  sessionId: string;
}

