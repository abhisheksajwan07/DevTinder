import { Response } from "express";
import crypto from "crypto";

import { env } from "../config/env.js";

const isProd = env.NODE_ENV === "production";

const COOKIE_OPTIONS = {
  httpOnly: true,
  secure: isProd,
  sameSite: "lax" as const,
};

export const setAccessTokenCookie = (res: Response, token: string) => {
  res.cookie("accessToken", token, {
    ...COOKIE_OPTIONS,
    maxAge: 15 * 60 * 1000,
  });
};

export const setRefreshTokenCookie = (res: Response, token: string) => {
  res.cookie("refreshToken", token, {
    ...COOKIE_OPTIONS,
    maxAge: 7 * 24 * 60 * 60 * 1000,
  });
};

export const setCsrfCookie = (res: Response) => {
  const token = crypto.randomBytes(32).toString("hex");
  res.cookie("csrfToken", token, {
    httpOnly: false,
    secure: isProd,
    sameSite: "lax" as const,
    maxAge: 7 * 24 * 60 * 60 * 1000, 
  });
};

export const clearAuthCookies = (res: Response) => {
  res.clearCookie("accessToken");
  res.clearCookie("refreshToken");
};
export const clearCsrfCookie = (res: Response) => {
  res.clearCookie("csrfToken");
};

export const setOauthStateCookie = (res: Response, state: string) => {
  res.cookie("oauth_state", state, {
    ...COOKIE_OPTIONS,
    maxAge: 10 * 60 * 1000, // 10 minutes
  });

  
};

export const clearOauthStateCookie = (res: Response) => {
  res.clearCookie("oauth_state");
};
