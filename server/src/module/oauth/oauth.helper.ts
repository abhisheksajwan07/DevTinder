import { Response } from "express";

import {
  setAccessTokenCookie,
  setCsrfCookie,
  setRefreshTokenCookie,
} from "../../utils/cookie.js";
import { User } from "./oauth.types.js";
import { sendResponse } from "../../utils/sendResponse.js";

export const sendOAuthSuccess = (
  res: Response,
  data: {
    user: User;
    isNewUser: boolean;
    accessToken: string;
    refreshToken: string;
    oauthPrefill?: {
      name: string;
      avatar: string;
      githubLogin?: string | null;
    };
  },
) => {
  setAccessTokenCookie(res, data.accessToken);
  setRefreshTokenCookie(res, data.refreshToken);
  setCsrfCookie(res);

  sendResponse(
    res,
    200,
    data.isNewUser ? "Account created successfully." : "Login successful.",
    {
      user: data.user,
      isNewUser: data.isNewUser,
      onBoardingComplete: data.user.onBoardingComplete,
      oauthPrefill: data.oauthPrefill ?? null,
    },
  );
};
