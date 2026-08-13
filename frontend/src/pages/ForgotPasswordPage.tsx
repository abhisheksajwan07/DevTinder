import { Link } from "react-router-dom";
import { ArrowLeft, Mail } from "lucide-react";

import { useForm } from "react-hook-form";
import { ForgetPasswordBody, useForgotPassword } from "../services/auth.api";

export default function ForgotPasswordPage() {
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<ForgetPasswordBody>();

  const forgotMutation = useForgotPassword();

  const forgotPassword = (data: ForgetPasswordBody) => {
    forgotMutation.mutate(data);
  };

  return (
    <AuthCard
      title="Reset your password"
      subtitle="Enter your email and we’ll send you a password reset link."
    >
      <form onSubmit={handleSubmit(forgotPassword)} className="space-y-4">
        <input
          type="email"
          {...register("email", {
            required: "email is required to send the reset code",
            pattern: {
              value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
              message: "Invalid email address",
            },
          })}
          placeholder="you@example.com"
          className="w-full rounded-2xl border border-[#e2ded6] px-4 py-3 text-sm outline-none focus:border-orange-500"
        />

        {errors.email && (
          <p className="text-[14px] text-red-600 m-2">{errors.email.message}</p>
        )}

        <button
          type="submit"
          disabled={forgotMutation.isPending}
          className="w-full rounded-2xl bg-[#1a1918] py-2.5 text-sm font-bold text-white hover:bg-orange-600"
        >
          {forgotMutation.isPending ? (
            <span className="size-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
          ) : (
            <div>
              <Mail className="mr-2 inline size-4" />
              <span> Send reset link</span>
            </div>
          )}
        </button>

        {forgotMutation.isSuccess && (
          <p className="mt-2 text-[16px] text-red-600">
            {forgotMutation.data.message}
          </p>
        )}

        {forgotMutation.isError && (
          <p className="mt-4 text-xs text-red-600">
            {forgotMutation.error.response?.data.message ||
              "Unable to send the reset link."}
          </p>
        )}
      </form>

      <Link
        to="/signin"
        className="mt-5 inline-flex items-center gap-2 text-xs font-semibold text-orange-600"
      >
        <ArrowLeft className="size-4.5" />
        <p className="text-[14px]">Back to sign in</p>
      </Link>
    </AuthCard>
  );
}

export function AuthCard({
  title,
  subtitle,
  children,
}: {
  title: string;
  subtitle: string;
  children: React.ReactNode;
}) {
  return (
    <main className="grid min-h-screen place-items-center bg-[#f5f2eb] px-4">
      <div className="w-full max-w-md rounded-[28px]  border border-[#e9e5df] bg-white p-7 shadow-sm sm:p-9">
        <h1 className="text-2xl font-bold text-[#242322]">{title}</h1>
        <p className="mt-2 mb-2 text-sm text-[#77736e]">{subtitle}</p>
        {children}
      </div>
    </main>
  );
}
