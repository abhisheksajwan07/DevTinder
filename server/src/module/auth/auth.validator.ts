import { z } from "zod";

export const signUpSchema = z.object({
  email: z.string().email("Invalid email").trim().toLowerCase(),
  password: z
    .string()
    .min(8, "Password must be at least 8 characters long")
    .max(70, "Password can't be more than 70 characters "),
});

export const verifyEmailSchema = z.object({
  email: z.email().trim().toLowerCase(),
  otp: z.string().length(6).regex(/^\d+$/, "OTP must be numeric"),
});
export const resendOtpSchema = z.object({
  email: z.email(),
});

export const signInSchema = z.object({
  email: z.email("Invalid email").trim().toLowerCase(),
  password: z
    .string()
    .min(8, "Password must be at least 8 characters long")
    .max(70, "Password can't be more than 70 characters "),
});

export const forgotPasswordSchema = z.object({
  email: z.email("Invalid email").trim().toLowerCase(),
});

export const resetPasswordSchema = z.object({
  token: z.string().min(1),
  newPassword: z
    .string()
    .min(8, "Password must be at least 8 characters")
    .max(70, "Password can't be more than 70 characters"),
});

export type SignUpDto = z.infer<typeof signUpSchema>;
export type VerifyEmailDto = z.infer<typeof verifyEmailSchema>;
export type SignInDto = z.infer<typeof signInSchema>;
export type ResetPasswordDto = z.infer<typeof resetPasswordSchema>;
