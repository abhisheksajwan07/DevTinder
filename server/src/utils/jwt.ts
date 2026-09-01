import jwt from "jsonwebtoken";
import { env } from "../config/env.js";
import { AccessTokenPayload } from "../types/jwt.types.js";

export const signAccessToken = (payload: AccessTokenPayload) => {
  return jwt.sign(payload, env.ACCESS_TOKEN_SECRET, {
    expiresIn: env.ACCESS_TOKEN_EXPIRES_IN,
  });
};



export const verifyAccessToken = (token: string) => {
  return jwt.verify(token, env.ACCESS_TOKEN_SECRET) as AccessTokenPayload;
};
