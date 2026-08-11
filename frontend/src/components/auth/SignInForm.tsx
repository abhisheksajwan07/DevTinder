import { ArrowRight } from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import { useForm } from "react-hook-form";

import { SignInCredentials, useSignIn } from "../../services/auth.api";
import { useState } from "react";

interface SignInFormProps {
  onSwitchToSignUp: () => void;
  onSocialAuth: (provider: string) => void;
}

export default function SignInForm({
  onSwitchToSignUp,
  onSocialAuth,
}: SignInFormProps) {

  
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<SignInCredentials>();

  const signInMutation = useSignIn();
  const navigate = useNavigate();
  //mutate doesn't return promise
  const saveUser = (data: SignInCredentials) => {
    signInMutation.mutate(data, {
      onSuccess: (data) => {
        if (data.data.user.onBoardingComplete) {
          navigate("/discover");
        } else {
          navigate("/onboarding");
        }
      },
    });
  };

  return (
    <div className="my-auto py-6 mx-auto w-full max-w-md">
      <h1 className="font-serif text-4xl sm:text-[54px] font-normal leading-[1.05] tracking-tight text-[#1a1918]">
        Welcome back.
      </h1>
      <p className="mt-3 text-sm text-[#77736e]">
        2,400+ developers waiting. Don't keep them.
      </p>

      {/* Social Auth Buttons */}
      <div className="mt-7 space-y-3">
        <button
          type="button"
          onClick={() => onSocialAuth("GitHub")}
          className="w-full inline-flex items-center justify-center gap-3 rounded-2xl border border-[#e4ded5] bg-white py-3.5 px-4 text-xs font-bold text-[#242322] shadow-xs transition hover:border-orange-300 hover:bg-[#faf8f5] active:scale-[0.99]"
        >
          <svg className="size-4 fill-current" viewBox="0 0 24 24">
            <path d="M12 0C5.37 0 0 5.37 0 12c0 5.31 3.435 9.795 8.205 11.385.6.105.825-.255.825-.57 0-.285-.015-1.23-.015-2.235-3.015.555-3.795-.735-4.035-1.41-.135-.345-.72-1.41-1.23-1.695-.42-.225-1.02-.78-.015-.795.945-.015 1.62.87 1.845 1.23 1.08 1.815 2.805 1.305 3.495.99.105-.78.42-1.305.765-1.605-2.67-.3-5.46-1.335-5.46-5.925 0-1.305.465-2.385 1.23-3.225-.12-.3-.54-1.53.12-3.18 0 0 1.005-.315 3.3 1.23.96-.27 1.98-.405 3-.405s2.04.135 3 .405c2.295-1.56 3.3-1.23 3.3-1.23.66 1.65.24 2.88.12 3.18.765.84 1.23 1.905 1.23 3.225 0 4.605-2.805 5.625-5.475 5.925.435.375.81 1.095.81 2.22 0 1.605-.015 2.895-.015 3.3 0 .315.225.69.825.57A12.02 12.02 0 0024 12c0-6.63-5.37-12-12-12z" />
          </svg>
          <span>Continue with GitHub</span>
        </button>

        <button
          type="button"
          onClick={() => onSocialAuth("Google")}
          className="w-full inline-flex items-center justify-center gap-3 rounded-2xl border border-[#e4ded5] bg-white py-3.5 px-4 text-xs font-bold text-[#242322] shadow-xs transition hover:border-orange-300 hover:bg-[#faf8f5] active:scale-[0.99]"
        >
          <svg className="size-4" viewBox="0 0 24 24">
            <path
              fill="#4285F4"
              d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
            />
            <path
              fill="#34A853"
              d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
            />
            <path
              fill="#FBBC05"
              d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
            />
            <path
              fill="#EA4335"
              d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
            />
          </svg>
          <span>Continue with Google</span>
        </button>
      </div>

      <div className="my-6 flex items-center gap-3">
        <div className="h-px flex-1 bg-[#e0dad0]" />
        <span className="font-mono text-[10px] font-semibold uppercase tracking-wider text-[#9c958e]">
          or sign in with email
        </span>
        <div className="h-px flex-1 bg-[#e0dad0]" />
      </div>

      <form onSubmit={handleSubmit(saveUser)} className="space-y-4">
        <div>
          <label
            htmlFor="signin-email"
            className="block font-mono text-[10px] font-bold uppercase tracking-wider text-[#77736e] mb-1.5"
          >
            EMAIL
          </label>
          <input
            type="email"
            {...register("email", {
              required: " Email is required",
            })}
            className="w-full rounded-2xl border border-[#e2ded6] bg-white px-4 py-3 text-sm text-[#242322] outline-none transition focus:border-orange-500 focus:ring-2 focus:ring-orange-500/20"
          />

          {errors.email && (
            <p className="text-[14px] text-red-600 m-2">
              {errors.email.message}
            </p>
          )}
        </div>

        <div>
          <div className="flex items-center justify-between mb-1.5">
            <label
              htmlFor="signin-password"
              className="block font-mono text-[10px] font-bold uppercase tracking-wider text-[#77736e]"
            >
              PASSWORD
            </label>
            <Link
              to="/forgot-password"
              className="text-xs font-semibold text-orange-600 hover:underline"
            >
              Forgot password?
            </Link>
          </div>
          <input
            type="password"
            id="signin-password"
            {...register("password", {
              required: "Password is required",
              minLength: {
                value: 8,
                message: "Password must be at least 8 characters",
              },
            })}
            className="w-full rounded-2xl border border-[#e2ded6] bg-white px-4 py-3 text-sm text-[#242322] outline-none transition focus:border-orange-500 focus:ring-2 focus:ring-orange-500/20"
          />
          {errors.password && (
            <p className="m-2 text-[14px] text-red-600">
              {errors.password?.message}
            </p>
          )}
        </div>

        <button
          type="submit"
          disabled={signInMutation.isPending}
          className="w-full inline-flex items-center justify-center gap-2 rounded-2xl bg-[#1a1918] py-3.5 px-4 text-sm font-bold text-white shadow-md transition hover:bg-orange-600 active:scale-[0.99] disabled:opacity-70 mt-2"
        >
          <span>{signInMutation.isPending ? "Signing in..." : "Sign In"}</span>
          {signInMutation.isPending ? (
            <span className="size-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
          ) : (
            <ArrowRight className="size-4" />
          )}
        </button>

        {signInMutation.isError && (
          <p className="text-sm text-red-600 text-center mt-2">
            {signInMutation.error.response?.data.message}
          </p>
        )}
      </form>

      <div className="mt-6 text-center text-xs text-[#77736e]">
        <p>
          No account?{" "}
          <button
            type="button"
            onClick={onSwitchToSignUp}
            className="font-semibold text-orange-600 hover:underline"
          >
            Create one for free &rarr;
          </button>
        </p>
      </div>
    </div>
  );
}
