import { Request, Response } from "express";
import crypto from "crypto";
import { AppError } from "../../utils/AppError.js";
import {
  clearOauthStateCookie,
  setAccessTokenCookie,
  setCsrfCookie,
  setOauthStateCookie,
  setRefreshTokenCookie,
} from "../../utils/cookie.js";
import { sendResponse } from "../../utils/sendResponse.js";
import { oauthService } from "./oauth.dependencies.js";
import { googleProvider } from "./providers/google.provider.js";
import { oauthCallbackSchema } from "./oauth.validator.js";



export const googleRedirectController = async (
  _req: Request,
  res: Response,
): Promise<void> => {
  const state = crypto.randomBytes(32).toString("hex");
  setOauthStateCookie(res, state);
  
  const authUrl = googleProvider.generateAuthUrl(state);
  res.redirect(authUrl);
};


export const googleCallbackController = async (
  req: Request,
  res: Response,
): Promise<void> => {
  const parsed = oauthCallbackSchema.safeParse(req.query);

  if (!parsed.success) {
    throw new AppError("Invalid callback parameters.", 400, "INVALID_OAUTH_PARAMS");
  }

  const { code, state, error } = parsed.data;

  // user denied access on Google's consent screen 
  if (error) {
    throw new AppError("Google OAuth was denied by the user.", 400, "OAUTH_ACCESS_DENIED");
  }


  const cookieState = req.cookies?.oauth_state;
  if (!state || !cookieState || state !== cookieState) {
    throw new AppError("Invalid or expired OAuth state.", 400, "INVALID_OAUTH_STATE");
  }
  
  // clear the state cookie once used
  clearOauthStateCookie(res);


  if (!code) {
    throw new AppError("Authorization code missing from Google callback.", 400, "MISSING_OAUTH_CODE");
  }

 
  const tokens = await googleProvider.exchangeCodeForTokens(code);

  // Fetch Google user profile → OAuthProfile 
  const profile = await googleProvider.getUserProfile(tokens.access_token);

  
  const { user, isNewUser, accessToken, rawRefreshToken } =
    await oauthService.loginWithOAuth("google", profile, {
      accessToken: tokens.access_token,
      refreshToken: tokens.refresh_token,
      expiresIn: tokens.expires_in,
    }, {
      userAgent: req.get("user-agent"),
      ipAddress: req.ip,
    });

  
  setAccessTokenCookie(res, accessToken);
  setRefreshTokenCookie(res, rawRefreshToken);
  setCsrfCookie(res);

  
  sendResponse(res, 200, isNewUser ? "Account created successfully." : "Login successful.", {
    user,
    isNewUser,
    onboardingComplete: user.onBoardingComplete,
  });
};
