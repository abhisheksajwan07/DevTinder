import { Link, useNavigate, useSearchParams } from "react-router-dom";

import { AuthCard } from "./ForgotPasswordPage";
import { useForm } from "react-hook-form";
import { useResetPassword } from "../services/auth.api";

export default function ResetPasswordPage() {
  const [searchParams] = useSearchParams();
  const token = searchParams.get("token");
  const {
    handleSubmit,
    register,
    watch,
    formState: { errors },
  } = useForm<{ newPassword: string; confirmPassword: string }>();
  const navigate = useNavigate();
  const resetMutation = useResetPassword();

  const onSubmit = (data: { newPassword: string; confirmPassword: string }) => {
    if (!token) return;
    resetMutation.mutate({
      token,
      newPassword: data.newPassword,
    });
  };

  return (
    <AuthCard
      title="Choose a new password"
      subtitle="Use at least 8 characters for your new password."
    >
      <form onSubmit={handleSubmit(onSubmit)} className="mt-5 space-y-4">
        <input
          type="password"
          {...register("newPassword", {
            required: "Password is required",
            minLength: {
              value: 8,
              message: "Min 8 characters",
            },
          })}
          placeholder="New password"
          className="w-full rounded-2xl border border-[#e2ded6] px-4 py-3 text-sm outline-none focus:border-orange-500"
        />

        {errors.newPassword && (
          <p className="text-[14px] text-red-600 m-2">
            {errors.newPassword.message}
          </p>
        )}

        <input
          type="password"
          {...register("confirmPassword", {
            required: "Please confirm your password",

            validate: (value) =>
              value === watch("newPassword") || "Passwords do not match",
          })}
          placeholder="Confirm new password"
          className="w-full rounded-2xl border border-[#e2ded6] px-4 py-3 text-sm outline-none focus:border-orange-500"
        />

        {errors.confirmPassword && (
          <p className="text-[14px] text-red-600 ">
            {errors.confirmPassword.message}
          </p>
        )}

        <button className="w-full rounded-2xl bg-[#1a1918] py-3.5 text-sm font-bold text-white hover:bg-orange-600">
          Update password
        </button>
      </form>

      {resetMutation.isSuccess ? (
        <button
          type="button"
          onClick={() => navigate("/signin")}
          className="mt-6 flex w-full items-center justify-center gap-2 rounded-2xl border border-orange-200 bg-amber-50 py-3.5 text-sm font-semibold text-orange-600 transition-all hover:border-orange-400 hover:bg-orange-100 active:scale-[0.98]"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="h-4 w-4"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            strokeWidth={2}
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M13 7l5 5m0 0l-5 5m5-5H6"
            />
          </svg>
          Continue to sign in
        </button>
      ) : null}
    </AuthCard>
  );
}
