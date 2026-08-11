import React, { useState, useEffect, useRef } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import {
  ArrowLeft,
  ArrowRight,
  CheckCircle2,
  Mail,
  RefreshCw,
  AlertCircle,
} from "lucide-react";
import { useVerifyEmail, useResendOtp } from "../../services/auth.api";

interface VerifyEmailFormProps {
  initialEmail?: string;
  onSwitchToSignIn?: () => void;
}

export default function VerifyEmailForm({
  initialEmail,
  onSwitchToSignIn,
}: VerifyEmailFormProps) {
  const navigate = useNavigate();
  const location = useLocation();

  // Get initial email from props, location state, or search params
  const locationEmail = (location.state as { email?: string })?.email;
  const queryParams = new URLSearchParams(location.search);
  const searchEmail = queryParams.get("email") || "";

  const [email] = useState<string>(
    initialEmail || locationEmail || searchEmail || "",
  );
  const [otp, setOtp] = useState<string[]>(["", "", "", "", "", ""]);
  const [resendCooldown, setResendCooldown] = useState<number>(60);
  const [resendMessage, setResendMessage] = useState<string | null>(null);

  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);

  const verifyEmailMutation = useVerifyEmail();
  const resendOtpMutation = useResendOtp();

  // Cooldown countdown effect for Resend OTP
  useEffect(() => {
    if (resendCooldown <= 0) return;
    const timer = setInterval(() => {
      setResendCooldown((prev) => prev - 1);
    }, 1000);
    return () => clearInterval(timer);
  }, [resendCooldown]);

  // Handle single digit input change
  const handleChange = (index: number, value: string) => {
    if (!/^\d*$/.test(value)) return;

    const newOtp = [...otp];
    // Take the last entered character if multiple typed
    newOtp[index] = value.slice(-1);
    setOtp(newOtp);

    // Auto-advance to next input if character entered
    if (value && index < 5) {
      inputRefs.current[index + 1]?.focus();
    }
  };

  // Handle key down (Backspace and Arrow keys navigation)
  const handleKeyDown = (
    index: number,
    e: React.KeyboardEvent<HTMLInputElement>,
  ) => {
    if (e.key === "Backspace") {
      if (!otp[index] && index > 0) {
        inputRefs.current[index - 1]?.focus();
      }
    } else if (e.key === "ArrowLeft" && index > 0) {
      inputRefs.current[index - 1]?.focus();
    } else if (e.key === "ArrowRight" && index < 5) {
      inputRefs.current[index + 1]?.focus();
    }
  };

  // Handle paste events (e.g., pasting "123456")
  const handlePaste = (e: React.ClipboardEvent<HTMLInputElement>) => {
    e.preventDefault();
    const pastedData = e.clipboardData.getData("text").trim();
    if (!/^\d+$/.test(pastedData)) return;

    const digits = pastedData.slice(0, 6).split("");
    const newOtp = [...otp];
    digits.forEach((digit, i) => {
      newOtp[i] = digit;
    });
    setOtp(newOtp);

    // Focus last filled input or last box
    const focusIndex = Math.min(digits.length, 5);
    inputRefs.current[focusIndex]?.focus();
  };

  // Handle Verification Submit
  const handleVerify = (e: React.FormEvent) => {
    e.preventDefault();
    const code = otp.join("");
    if (code.length !== 6 || !email) return;

    verifyEmailMutation.mutate(
      { email, otp: code },
      {
        onSuccess: (data) => {
          const user = data?.data?.user;
          if (user?.onBoardingComplete) {
            navigate("/app/discover");
          } else {
            navigate("/onboarding");
          }
        },
      },
    );
  };

  // Handle Resend OTP Code

  const handleResendOtp = () => {
    if (resendCooldown > 0 || resendOtpMutation.isPending || !email) return;

    setResendMessage(null);

    resendOtpMutation.mutate(
      { email },
      {
        onSuccess: (data) => {
          setResendMessage(
            data.message || "A new code has been sent to your email.",
          );
          setResendCooldown(60);
        },
      },
    );
  };

  const isOtpComplete = otp.every((digit) => digit !== "");

  return (
    <div className="my-auto py-6 mx-auto w-full max-w-md">
      {/* Title Header */}
      <h1 className="font-serif text-3xl sm:text-[44px] font-normal leading-[1.08] tracking-tight text-[#1a1918]">
        Verify your email.
      </h1>
      <p className="mt-3 text-sm text-[#77736e]">
        We sent a 6-digit code to{" "}
        <span className="font-semibold text-[#1a1918]">
          {email || "your email address"}
        </span>{" "}
        to confirm your account.
      </p>

      {/* Email Display (Read-Only) */}
      <div className="mt-6 rounded-2xl border border-[#e4ded5] bg-white p-4 shadow-xs">
        <div className="flex items-center gap-3 min-w-0">
          <div className="grid size-9 shrink-0 place-items-center rounded-xl bg-orange-50 text-orange-600">
            <Mail className="size-4" />
          </div>
          <div className="min-w-0">
            <p className="font-mono text-[10px] font-bold uppercase tracking-wider text-[#9c958e]">
              SENT TO
            </p>
            <p className="truncate text-sm font-semibold text-[#242322]">
              {email || "your email address"}
            </p>
          </div>
        </div>
      </div>

      {/* Verification Code Form */}
      <form onSubmit={handleVerify} className="mt-6 space-y-6">
        <div>
          <label className="block font-mono text-[10px] font-bold uppercase tracking-wider text-[#77736e] mb-2.5">
            ENTER 6-DIGIT CODE
          </label>
          <div className="grid grid-cols-6 gap-2 sm:gap-3">
            {otp.map((digit, index) => (
              <input
                key={index}
                ref={(el) => {
                  inputRefs.current[index] = el;
                }}
                type="text"
                inputMode="numeric"
                maxLength={1}
                value={digit}
                onChange={(e) => handleChange(index, e.target.value)}
                onKeyDown={(e) => handleKeyDown(index, e)}
                onPaste={handlePaste}
                className="h-13 sm:h-14 text-center text-xl sm:text-2xl font-bold text-[#1a1918] bg-white border border-[#e2ded6] rounded-2xl outline-none transition focus:border-orange-500 focus:ring-2 focus:ring-orange-500/20 shadow-xs"
              />
            ))}
          </div>
        </div>

        {/* Action Button */}
        <button
          type="submit"
          disabled={!isOtpComplete || verifyEmailMutation.isPending}
          className="w-full inline-flex items-center justify-center gap-2 rounded-2xl bg-[#1a1918] py-3.5 px-4 text-sm font-bold text-white shadow-md transition hover:bg-orange-600 active:scale-[0.99] disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <span>Verify Email</span>
          {verifyEmailMutation.isPending ? (
            <span className="size-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
          ) : (
            <ArrowRight className="size-4" />
          )}
        </button>
      </form>

      {/* Feedback Messages */}
      {verifyEmailMutation.isError && (
        <div className="mt-4 flex items-center gap-2.5 rounded-2xl bg-red-50 border border-red-200 p-3.5 text-xs text-red-700">
          <AlertCircle className="size-4 shrink-0 text-red-500" />
          <p>
            {verifyEmailMutation.error?.response?.data?.message ||
              verifyEmailMutation.error?.message ||
              "Verification failed. Please check the code."}
          </p>
        </div>
      )}

      {resendMessage && (
        <div className="mt-4 flex items-center gap-2.5 rounded-2xl bg-emerald-50 border border-emerald-200 p-3.5 text-xs text-emerald-800">
          <CheckCircle2 className="size-4 shrink-0 text-emerald-600" />
          <p>{resendMessage}</p>
        </div>
      )}

      {resendOtpMutation.isError && (
        <div className="mt-4 flex items-center gap-2.5 rounded-2xl bg-red-50 border border-red-200 p-3.5 text-xs text-red-700">
          <AlertCircle className="size-4 shrink-0 text-red-500" />
          <p>
            {resendOtpMutation.error?.response?.data?.message ||
              resendOtpMutation.error?.message ||
              "Could not resend verification code."}
          </p>
        </div>
      )}

      {/* Resend OTP Section */}
      <div className="mt-6 flex flex-col items-center justify-center space-y-2 border-t border-[#e0dad0] pt-6">
        <p className="text-xs text-[#77736e]">Didn't receive code?</p>
        <button
          type="button"
          onClick={handleResendOtp}
          disabled={resendCooldown > 0 || resendOtpMutation.isPending || !email}
          className="inline-flex items-center gap-2 text-xs font-semibold text-orange-600 hover:underline disabled:text-[#a39d95] disabled:no-underline"
        >
          {resendOtpMutation.isPending ? (
            <RefreshCw className="size-3.5 animate-spin" />
          ) : (
            <RefreshCw className="size-3.5" />
          )}
          <span>
            {resendCooldown > 0
              ? `Resend code in ${resendCooldown}s`
              : "Resend Code"}
          </span>
        </button>
      </div>

      {/* Navigation Footer */}
      <div className="mt-6 text-center text-xs text-[#77736e]">
        <button
          type="button"
          // When you use ?? with an arrow function, the fallback function
          // must be wrapped so JavaScript can parse it as one expression.
          onClick={onSwitchToSignIn ?? (() => navigate("/signin"))}
          className="inline-flex items-center gap-1.5 font-semibold text-orange-600 hover:underline"
        >
          <ArrowLeft className="size-3.5" />
          <span>Back to sign in</span>
        </button>
      </div>
    </div>
  );
}
