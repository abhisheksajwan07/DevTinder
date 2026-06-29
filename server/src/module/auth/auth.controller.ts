// auth.controller.ts
import { Request, Response } from "express";
import { SignUpDto, VerifyEmailDto } from "./auth.validator.js";
import { authService } from "./auth.dependencies.js";
import { sendResponse } from "../../utils/sendResponse.js";
import { setAccessTokenCookie, setCsrfCookie, setRefreshTokenCookie } from "../../utils/cookie.js";

export const signUpController = async (
  req: Request<{}, {}, SignUpDto>,
  res: Response,
) => {
  const result = await authService.runSignupPipeline(req.body);
  sendResponse(res, 201, result.message, null);
};

export const verifyEmailController = async (
  req: Request<{}, {}, VerifyEmailDto>,
  res: Response,
) => {
  const { user, accessToken, rawRefreshToken } = await authService.verifyEmail(
    req.body,
    {
      userAgent: req.headers["user-agent"],
      ipAddress: req.ip,
    },
  );

  setAccessTokenCookie(res, accessToken);
  setRefreshTokenCookie(res, rawRefreshToken);
  setCsrfCookie(res);

    sendResponse(res, 200, "Email verified successfully.", { user });
};
