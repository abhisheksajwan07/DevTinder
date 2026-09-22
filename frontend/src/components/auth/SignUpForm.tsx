import { useState } from "react";
import { ArrowRight, Check } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";

import { signUpSchema, type SignUpFormValues } from "../../schemas/auth.schema";
import { type SignUpCredentials, useSignUp } from "../../services/auth.api";

interface SignUpFormProps {
  onSwitchToSignIn: () => void;
  onSocialAuth: (provider: string) => void;
}

export default function SignUpForm({
  onSwitchToSignIn,
  onSocialAuth,
}: SignUpFormProps) {
  const [agreed, setAgreed] = useState(false);

  const {
    handleSubmit,
    register,
    watch,
    formState: { errors },
  } = useForm<SignUpFormValues>({
    resolver: zodResolver(signUpSchema),
  });

  const password = watch("password", "");
  const email = watch("email", "");

  const getPasswordStrength = (pass: string) => {
    if (!pass) {
      return { score: 0, label: "Weak", width: "15%", color: "bg-red-400" };
    }
    if (pass.length < 6) {
      return { score: 1, label: "Weak", width: "30%", color: "bg-red-500" };
    }
    if (pass.length < 10) {
      return { score: 2, label: "Good", width: "70%", color: "bg-orange-500" };
    }
    return {
      score: 3,
      label: "Strong",
      width: "100%",
      color: "bg-emerald-500",
    };
  };

  const strength = getPasswordStrength(password);

  const navigate = useNavigate();
  const signUpMutation = useSignUp();

  const errorStatus = signUpMutation.error?.response?.status;
  const errorData = signUpMutation.error?.response?.data as
    { code?: string; message?: string } | undefined;
  const isUnverified =
    errorData?.code === "EMAIL_NOT_VERIFIED" ||
    (errorStatus === 409 &&
      typeof errorData?.message === "string" &&
      errorData.message.toLowerCase().includes("verifi"));

  const onSubmit = (formData: SignUpCredentials) => {
    if (!agreed) {
      return alert("Agree to the Terms and Privacy Policy");
    }

    signUpMutation.mutate(formData, {
      onSuccess: () => {
        navigate("/verify-email", { state: { email: formData.email } });
      },
    });
  };

  return (
    <div className="mx-auto my-auto w-full max-w-md py-4 sm:py-6">
      <h1 className="font-serif text-4xl font-normal leading-[1.05] tracking-tight text-[#1a1918] sm:text-5xl">
        Create your profile.
      </h1>
      <p className="mt-3 text-sm text-[#77736e]">
        Your GitHub tells us more than a form ever will.
      </p>

      {/* Social Auth Buttons */}
      <div className="mt-7 space-y-3">
        <button
          type="button"
          onClick={() => onSocialAuth("github")}
          className="w-full inline-flex items-center justify-center gap-3 rounded-2xl border border-[#e4ded5] bg-white py-3.5 px-4 text-xs font-bold text-[#242322] shadow-xs transition hover:border-orange-300 hover:bg-[#faf8f5] active:scale-[0.99]"
        >
          <svg className="size-4 fill-current" viewBox="0 0 24 24">
            <path d="M12 0C5.37 0 0 5.37 0 12c0 5.31 3.435 9.795 8.205 11.385.6.105.825-.255.825-.57 0-.285-.015-1.23-.015-2.235-3.015.555-3.795-.735-4.035-1.41-.135-.345-.72-1.41-1.23-1.695-.42-.225-1.02-.78-.015-.795.945-.015 1.62.87 1.845 1.23 1.08 1.815 2.805 1.305 3.495.99.105-.78.42-1.305.765-1.605-2.67-.3-5.46-1.335-5.46-5.925 0-1.305.465-2.385 1.23-3.225-.12-.3-.54-1.53.12-3.18 0 0 1.005-.315 3.3 1.23.96-.27 1.98-.405 3-.405s2.04.135 3 .405c2.295-1.56 3.3-1.23 3.3-1.23.66 1.65.24 2.88.12 3.18.765.84 1.23 1.905 1.23 3.225 0 4.605-2.805 5.625-5.475 5.925.435.375.81 1.095.81 2.22 0 1.605-.015 2.895-.015 3.3 0 .315.225.69.825.57A12.02 12.02 0 0024 12c0-6.63-5.37-12-12-12z" />
          </svg>
          <span>Sign up with GitHub</span>
        </button>

        <button
          type="button"
          onClick={() => onSocialAuth("google")}
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
          <span>Sign up with Google</span>
        </button>
      </div>

      <div className="my-5 flex items-center gap-3">
        <div className="h-px flex-1 bg-[#e0dad0]" />
        <span className="font-mono text-[10px] font-semibold uppercase tracking-wider text-[#9c958e]">
          or use email + password
        </span>
        <div className="h-px flex-1 bg-[#e0dad0]" />
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        <div>
          <label
            htmlFor="signup-email"
            className="block font-mono text-[10px] font-bold uppercase tracking-wider text-[#77736e] mb-1.5"
          >
            EMAIL
          </label>
          <input
            type="email"
            {...register("email")}
            className="w-full rounded-2xl border border-[#e2ded6] bg-white px-4 py-3 text-sm text-[#242322] outline-none transition focus:border-orange-500 focus:ring-2 focus:ring-orange-500/20"
          />

          {errors.email && (
            <p className="text-[14px] text-red-600 m-2">
              {errors.email.message}
            </p>
          )}
        </div>

        <div>
          <label
            htmlFor="signup-password"
            className="block font-mono text-[10px] font-bold uppercase tracking-wider text-[#77736e] mb-1.5"
          >
            PASSWORD
          </label>
          <input
            id="signup-password"
            type="password"
            {...register("password")}
            placeholder="Min. 8 characters"
            className="w-full rounded-2xl border border-[#e2ded6] bg-white px-4 py-3 text-sm text-[#242322] outline-none transition focus:border-orange-500 focus:ring-2 focus:ring-orange-500/20"
          />
          {errors.password && (
            <p className="m-2 text-[14px] text-red-600">
              {errors.password?.message}
            </p>
          )}

          <div className="mt-2">
            <div className="h-1 w-full overflow-hidden rounded-full bg-[#e4dfd6]">
              <div
                className={`h-full transition-all duration-300 ${strength.color}`}
                style={{ width: strength.width }}
              />
            </div>
            <p className="mt-1.5 font-mono text-[11px] text-[#77736e]">
              Strength:{" "}
              <span className="font-semibold text-[#242322]">
                {strength.label}
              </span>
            </p>
          </div>
        </div>

        <div className="pt-1 flex items-start gap-2 text-xs text-[#66615c]">
          <button
            type="button"
            role="checkbox"
            aria-checked={agreed}
            onClick={() => setAgreed(!agreed)}
            className={`mt-0.5 grid size-4 shrink-0 place-items-center rounded border transition ${
              agreed
                ? "border-orange-500 bg-orange-500 text-white"
                : "border-[#c8c2b8] bg-white"
            }`}
          >
            {agreed && <Check className="size-3 stroke-3" />}
          </button>
          <span>
            I agree to the{" "}
            <a
              href="#terms"
              className="font-semibold text-orange-600 hover:underline"
            >
              Terms
            </a>{" "}
            and{" "}
            <a
              href="#privacy"
              className="font-semibold text-orange-600 hover:underline"
            >
              Privacy Policy
            </a>
          </span>
        </div>

        <button
          type="submit"
          disabled={signUpMutation.isPending}
          className="w-full inline-flex items-center justify-center gap-2 rounded-2xl bg-[#1a1918] py-3.5 px-4 text-sm font-bold text-white shadow-md transition hover:bg-orange-600 active:scale-[0.99] disabled:opacity-70 mt-2"
        >
          <span>Create Account</span>
          {signUpMutation.isPending ? (
            <span className="size-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
          ) : (
            <ArrowRight className="size-4" />
          )}
        </button>

        {signUpMutation.isError &&
          (isUnverified ? (
            <div className="mt-2 p-3.5 rounded-2xl bg-amber-50 border border-amber-200 text-left">
              <p className="text-xs font-semibold text-amber-900">
                Your account already exists but isn't verified yet.
              </p>
              <p className="mt-1 text-xs text-amber-700">
                Enter the verification code sent to your email to activate your
                account.
              </p>
              <button
                type="button"
                onClick={() => navigate("/verify-email", { state: { email } })}
                className="mt-2.5 inline-flex items-center gap-1.5 text-xs font-bold text-orange-600 hover:text-orange-700 hover:underline cursor-pointer"
              >
                <span>Verify email now</span>
                <ArrowRight className="size-3.5" />
              </button>
            </div>
          ) : (
            <div className="flex items-center gap-2 mt-2 px-3 py-2 rounded-md bg-red-50 border border-red-200">
              <svg
                className="w-4 h-4 text-red-500 shrink-0"
                fill="currentColor"
                viewBox="0 0 20 20"
              >
                <path
                  fillRule="evenodd"
                  d="M10 18a8 8 0 100-16 8 8 0 000 16zm-.75-11.25a.75.75 0 011.5 0v4.5a.75.75 0 01-1.5 0v-4.5zm.75 7.5a.75.75 0 100-1.5.75.75 0 000 1.5z"
                  clipRule="evenodd"
                />
              </svg>
              <p className="text-sm text-red-600">
                {errorData?.message || "Something went wrong"}
              </p>
            </div>
          ))}
      </form>

      <div className="mt-6 text-center text-xs text-[#77736e]">
        <p>
          Already have an account?{" "}
          <button
            type="button"
            onClick={onSwitchToSignIn}
            className="font-semibold text-orange-600 hover:underline"
          >
            Sign in &rarr;
          </button>
        </p>
      </div>
    </div>
  );
}
