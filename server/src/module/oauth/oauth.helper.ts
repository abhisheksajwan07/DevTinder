import { Response } from "express";

import {
  setAccessTokenCookie,
  setCsrfCookie,
  setRefreshTokenCookie,
} from "../../utils/cookie.js";
import { User } from "./oauth.types.js";
import { env } from "../../config/env.js";

export const sendOAuthSuccess = (
  res: Response,
  data: {
    user: User;
    isNewUser: boolean;
    accessToken: string;
    refreshToken: string;
  },
) => {
  setAccessTokenCookie(res, data.accessToken);
  setRefreshTokenCookie(res, data.refreshToken);
  setCsrfCookie(res);

  // Redirect the browser back to the frontend SPA.
  // For new users, go to onboarding; existing users go to the app.
  let redirectUrl: string;

  if (data.isNewUser) {
    redirectUrl = `${env.CLIENT_URL}/onboarding`;
  } else if (!data.user.onBoardingComplete) {
    redirectUrl = `${env.CLIENT_URL}/onboarding`;
  } else {
    redirectUrl = `${env.CLIENT_URL}/app/discover`;
  }

  res.redirect(redirectUrl);
};
