// auth.controller.ts
import { Request, Response } from "express";
import {
  ResetPasswordDto,
  SignInDto,
  SignUpDto,
  VerifyEmailDto,
} from "./auth.validator.js";
import { authService } from "./auth.dependencies.js";
import { sendResponse } from "../../utils/sendResponse.js";
import {
  setAccessTokenCookie,
  setCsrfCookie,
  setRefreshTokenCookie,
} from "../../utils/cookie.js";
import { AppError } from "../../utils/AppError.js";

export const signUpController = async (
  req: Request<{}, {}, SignUpDto>,
  res: Response,
) => {
  const result = await authService.runSignupPipeline(req.body);
  sendResponse(
    res,
    201,
    "SignUp completed ! Check your email for verification",
  );
};

export const getMeController = async (req: Request, res: Response) => {
  if (!req.user) {
    throw new AppError("Unauthorized", 401);
  }
  const user = await authService.getMe(req.user.userId);
  sendResponse(res, 200, "User fetched successfully", { user });
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

export const resendVerificationController = async (
  req: Request,
  res: Response,
) => {
  const result = await authService.resendVerificationOtp(req.body.email);

  return sendResponse(res, 200, "Verification OTP sent successfully.");
};

export const signInController = async (
  req: Request<{}, {}, SignInDto>,
  res: Response,
) => {
  const result = await authService.login(req.body, {
    userAgent: req.headers["user-agent"],
    ipAddress: req.ip,
  });

  setAccessTokenCookie(res, result.accessToken);
  setRefreshTokenCookie(res, result.rawRefreshToken);
  setCsrfCookie(res);
  sendResponse(res, 201, "SignIn successful", { user: result.user });
};

export const forgotPasswordController = async (req: Request, res: Response) => {
  await authService.forgotPassword(req.body.email);
  sendResponse(res, 201, "If this email exists, you will receive a reset link");
};
export const resetPasswordController = async (
  req: Request<{}, {}, ResetPasswordDto>,
  res: Response,
) => {
  const { token, newPassword } = req.body;

  await authService.resetPassword({ token, newPassword });
  sendResponse(res, 201, "Password reset successful ! please login again !");
};
