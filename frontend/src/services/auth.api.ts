import { useMutation } from "@tanstack/react-query";
import { useAuthStore } from "../stores/auth.store";
import { api } from "../services/api";
import { AxiosError } from "axios";

// SIGNIN TYPE & CALL
export interface SignInCredentials {
  email: string;
  password: string;
}

export interface User {
  id: string;
  email: string;
  onBoardingComplete: boolean;
}

export interface SignInResponse {
  success: boolean;
  message: string;
  data: {
    user: User;
  };
}

const signInCredentials = async (
  credentials: SignInCredentials,
): Promise<SignInResponse> => {
  const res = await api.post<SignInResponse>("/auth/signin", credentials);
  return res.data;
};

export function useSignIn() {
  const setUser = useAuthStore((state) => state.setUser);

  return useMutation<
    SignInResponse,
    AxiosError<{ message: string }>,
    SignInCredentials
  >({
    mutationFn: signInCredentials,
    onSuccess: (data) => {
      setUser(data.data.user);
    },
  });
}

// SIGNUP TYPES & CALL

export interface SignUpCredentials {
  email: string;
  password: string;
}
export interface SignUpResponse {
  success: boolean;
  message: string;
}
const signUpCredentials = async (
  credentials: SignUpCredentials,
): Promise<SignUpResponse> => {
  const { data } = await api.post("/auth/signup", credentials);
  return data;
};
export const useSignUp = () => {
  return useMutation<
    SignUpResponse,
    AxiosError<{ message: string }>,
    SignUpCredentials
  >({
    mutationFn: signUpCredentials,
    onError: (err: Error) => {},
  });
};

// VERIFY-EMAIL

export interface VerifyEmailBody {
  email: string;
  otp: string;
}
export interface VerifyEmailResponse {
  success: boolean;
  message: string;
  data: {
    user: {
      id: string;
      email: string;
      onBoardingComplete: boolean;
    };
  };
}

const verifyEmail = async (
  verifyData: VerifyEmailBody,
): Promise<VerifyEmailResponse> => {
  const { data } = await api.post<VerifyEmailResponse>(
    "/auth/verify-email",
    verifyData,
  );
  return data;
};

export const useVerifyEmail = () => {
  const setUser = useAuthStore((state) => state.setUser);

  return useMutation<
    VerifyEmailResponse,
    AxiosError<{ message: string }>,
    VerifyEmailBody
  >({
    mutationFn: verifyEmail,
    onSuccess: (res) => {
      if (res?.data?.user) {
        setUser(res.data.user);
      }
    },
  });
};

// RESEND OTP

export interface ResendOtpBody {
  email: string;
}

export interface ResendOtpResponse {
  success: boolean;
  message: string;
}

const resendOtp = async (body: ResendOtpBody): Promise<ResendOtpResponse> => {
  const { data } = await api.post<ResendOtpResponse>(
    "/auth/resend-verification-otp",
    body,
  );
  return data;
};

export const useResendOtp = () => {
  return useMutation<
    ResendOtpResponse,
    AxiosError<{ message: string }>,
    ResendOtpBody
  >({
    mutationFn: resendOtp,
  });
};

// forget password

export interface ForgetPasswordBody {
  email: string;
}
export interface ForgetPasswordResponse {
  status: string;
  message: string;
}

const forgotPassword = async (
  email: ForgetPasswordBody,
): Promise<ForgetPasswordResponse> => {
  const { data } = await api.post("/auth/forgot-password", email);
  return data;
};

export const useForgotPassword = () => {
  return useMutation<
    ForgetPasswordResponse,
    AxiosError<{ message: string }>,
    ForgetPasswordBody
  >({
    mutationFn: forgotPassword,
  });
};

// reset password

export interface ResetPasswordBody {
  token: string;
  newPassword: string;
}
export interface ResetPasswordResponse {
  status: string;
  message: string;
}

const resetPassword = async (
  body: ResetPasswordBody,
): Promise<ResetPasswordResponse> => {
  const { data } = await api.post("/auth/reset-password", body);
  return data;
};

export const useResetPassword = () => {
  return useMutation<
    ResetPasswordResponse,
    AxiosError<{ message: string }>,
    ResetPasswordBody
  >({
    mutationFn: resetPassword,
  });
};


// GET me


export const getMe = async():Promise<User>=>{
  const {data}= await api.get("/auth/me")
  return data.data.user;
}