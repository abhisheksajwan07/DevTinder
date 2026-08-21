import { Request, Response } from "express";
import crypto from "crypto";
import { AppError } from "../../utils/AppError.js";
import {
  clearOauthStateCookie,
  setOauthStateCookie,
} from "../../utils/cookie.js";

import { oauthService } from "./oauth.dependencies.js";
import { googleProvider } from "./providers/google.provider.js";
import { githubProvider } from "./providers/github.provider.js";
import { oauthCallbackSchema } from "./oauth.validator.js";
import { sendOAuthSuccess } from "./oauth.helper.js";
import { githubSyncQueue } from "../../queues/github-sync.queue.js";
import { env } from "../../config/env.js";

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
    throw new AppError(
      "Invalid callback parameters.",
      400,
      "INVALID_OAUTH_PARAMS",
    );
  }

  const { code, state, error } = parsed.data;

  // user denied access on Google's consent screen
  if (error) {
    throw new AppError(
      "Google OAuth was denied by the user.",
      400,
      "OAUTH_ACCESS_DENIED",
    );
  }

  const cookieState = req.cookies?.oauth_state;
  if (!state || !cookieState || state !== cookieState) {
    throw new AppError(
      "Invalid or expired OAuth state.",
      400,
      "INVALID_OAUTH_STATE",
    );
  }

  // clear the state cookie once used
  clearOauthStateCookie(res);

  if (!code) {
    throw new AppError(
      "Authorization code missing from Google callback.",
      400,
      "MISSING_OAUTH_CODE",
    );
  }

  const tokens = await googleProvider.exchangeCodeForTokens(code);
  if (!tokens || !tokens.access_token) {
    throw new AppError(
      "Failed to obtain tokens from Google.",
      500,
      "OAUTH_TOKEN_ERROR",
    );
  }
  // Fetch Google user profile → OAuthProfile
  const profile = await googleProvider.getUserProfile(tokens.access_token);

  const { user, isNewUser, accessToken, rawRefreshToken } =
    await oauthService.loginWithOAuth(
      "google",
      profile,
      {
        accessToken: tokens.access_token,
        refreshToken: tokens.refresh_token,
        expiresIn: tokens.expires_in,
      },
      {
        userAgent: req.get("user-agent"),
        ipAddress: req.ip,
      },
    );

  sendOAuthSuccess(res, {
    user,
    isNewUser,
    accessToken,
    refreshToken: rawRefreshToken,
  });
};

export const githubRedirectController = async (
  _req: Request,
  res: Response,
): Promise<void> => {
  const state = crypto.randomBytes(32).toString("hex");
  setOauthStateCookie(res, state);

  const authUrl = githubProvider.generateAuthUrl(state);
  res.redirect(authUrl);
};

export const githubCallbackController = async (
  req: Request,
  res: Response,
): Promise<void> => {
  const parsed = oauthCallbackSchema.safeParse(req.query);

  if (!parsed.success) {
    throw new AppError(
      "Invalid callback parameters.",
      400,
      "INVALID_OAUTH_PARAMS",
    );
  }

  const { code, state, error } = parsed.data;

  if (error) {
    throw new AppError(
      "GitHub OAuth was denied by the user.",
      400,
      "OAUTH_ACCESS_DENIED",
    );
  }

  const cookieState = req.cookies?.oauth_state;
  if (!state || !cookieState || state !== cookieState) {
    throw new AppError(
      "Invalid or expired OAuth state.",
      400,
      "INVALID_OAUTH_STATE",
    );
  }

  clearOauthStateCookie(res);

  if (!code) {
    throw new AppError(
      "Authorization code missing from GitHub callback.",
      400,
      "MISSING_OAUTH_CODE",
    );
  }

  const tokens = await githubProvider.exchangeCodeForTokens(code);
  if (!tokens || !tokens.access_token) {
    throw new AppError(
      "Failed to obtain tokens from GitHub.",
      500,
      "OAUTH_TOKEN_ERROR",
    );
  }
  const profile = await githubProvider.getUserProfile(tokens.access_token);

  const { user, isNewUser, accessToken, rawRefreshToken } =
    await oauthService.loginWithOAuth(
      "github",
      profile,
      {
        accessToken: tokens.access_token,
        refreshToken: tokens.refresh_token,
        expiresIn: tokens.expires_in ?? 0,
      },
      {
        userAgent: req.get("user-agent"),
        ipAddress: req.ip,
      },
    );

  sendOAuthSuccess(res, {
    user,
    isNewUser,
    accessToken,
    refreshToken: rawRefreshToken,
  });
};

export const githubConnectRedirectController = async (
  req: Request,
  res: Response,
): Promise<void> => {
  if (!req.user?.userId) {
    throw new AppError("Unauthorized", 401);
  }

  const state = crypto.randomBytes(32).toString("hex");
  setOauthStateCookie(res, state);
  res.redirect(
    githubProvider.generateAuthUrl(state, githubProvider.getConnectRedirectUri()),
  );
};

export const githubConnectCallbackController = async (
  req: Request,
  res: Response,
): Promise<void> => {
  if (!req.user?.userId) {
    throw new AppError("Unauthorized", 401);
  }

  const parsed = oauthCallbackSchema.safeParse(req.query);
  if (!parsed.success) {
    throw new AppError(
      "Invalid callback parameters.",
      400,
      "INVALID_OAUTH_PARAMS",
    );
  }

  const { code, state, error } = parsed.data;
  if (error) {
    throw new AppError(
      "GitHub OAuth was denied by the user.",
      400,
      "OAUTH_ACCESS_DENIED",
    );
  }

  const cookieState = req.cookies?.oauth_state;
  if (!state || !cookieState || state !== cookieState) {
    throw new AppError(
      "Invalid or expired OAuth state.",
      400,
      "INVALID_OAUTH_STATE",
    );
  }
  clearOauthStateCookie(res);

  if (!code) {
    throw new AppError(
      "Authorization code missing from GitHub callback.",
      400,
      "MISSING_OAUTH_CODE",
    );
  }

  const tokens = await githubProvider.exchangeCodeForTokens(
    code,
    githubProvider.getConnectRedirectUri(),
  );
  if (!tokens?.access_token) {
    throw new AppError(
      "Failed to obtain tokens from GitHub.",
      500,
      "OAUTH_TOKEN_ERROR",
    );
  }

  const profile = await githubProvider.getUserProfile(tokens.access_token);
  const { profileId } = await oauthService.connectGitHub(
    req.user.userId,
    profile,
    {
      accessToken: tokens.access_token,
      refreshToken: tokens.refresh_token,
      expiresIn: tokens.expires_in ?? 0,
    },
  );

  if (profileId) {
    await githubSyncQueue.add(
      "github_sync",
      { profileId },
      { jobId: `github-sync-${profileId}` },
    );
  }

  // A connection started during onboarding has no profile yet. A connection
  // started later belongs to Settings, where the user can see sync controls.
  res.redirect(
    `${env.CLIENT_URL}${profileId ? "/app/settings" : "/onboarding?step=6&github=connected"}`,
  );
};
