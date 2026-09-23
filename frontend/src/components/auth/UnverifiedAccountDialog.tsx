import { ArrowRight, Mail, X } from "lucide-react";
import { useNavigate } from "react-router-dom";

interface UnverifiedAccountDialogProps {
  isOpen: boolean;
  onClose: () => void;
  email: string;
}

export function UnverifiedAccountDialog({
  isOpen,
  onClose,
  email,
}: UnverifiedAccountDialogProps) {
  const navigate = useNavigate();

  if (!isOpen) return null;

  const handleVerifyNow = () => {
    navigate("/verify-email", { state: { email } });
  };

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="unverified-dialog-title"
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm animate-in fade-in duration-200"
    >
      <div className="relative max-h-[calc(100dvh-2rem)] w-full max-w-md overflow-y-auto rounded-[28px] border border-[#e9e5df] bg-white p-6 sm:p-7 shadow-2xl">
        {/* Close Button */}
        <button
          type="button"
          onClick={onClose}
          aria-label="Close dialog"
          className="absolute top-5 right-5 grid size-8 place-items-center rounded-xl text-[#77736e] transition hover:bg-[#f5f2eb] hover:text-[#1a1918]"
        >
          <X className="size-4" />
        </button>

        {/* Header with Icon and Tag */}
        <div className="flex items-center gap-3">
          <div className="grid size-11 place-items-center rounded-2xl bg-orange-50 border border-orange-100 text-orange-600 shrink-0">
            <Mail className="size-5" />
          </div>
          <div>
            <span className="inline-flex items-center gap-1.5 rounded-full border border-orange-200/60 bg-orange-50 px-2.5 py-0.5 font-mono text-[10px] font-bold uppercase tracking-wider text-orange-600">
              <span className="size-1.5 rounded-full bg-orange-500 animate-pulse" />
              Verification Pending
            </span>
            <p className="font-mono text-[11px] text-[#9c958e] mt-0.5">
              Step 2 of 3 • Email Verification
            </p>
          </div>
        </div>

        {/* Title and Description */}
        <div className="mt-5">
          <h2
            id="unverified-dialog-title"
            className="font-serif text-2xl sm:text-[26px] font-normal leading-snug tracking-tight text-[#1a1918]"
          >
            Your account already exists.
          </h2>
          <p className="mt-2 text-xs leading-relaxed text-[#77736e]">
            An account associated with{" "}
            <span className="font-semibold text-[#1a1918] break-all">
              {email || "this email"}
            </span>{" "}
            has been created, but hasn't been verified yet.
          </p>
        </div>

        {/* Info callout card */}
        <div className="mt-4 rounded-2xl border border-[#e4ded5] bg-[#faf8f5] p-3.5 text-xs text-[#55504b] leading-relaxed">
          <p>
            We already sent a 6-digit verification code to your inbox. Enter the
            code to activate your account and continue setup.
          </p>
        </div>

        {/* Action Buttons */}
        <div className="mt-6 flex flex-col gap-2.5">
          <button
            type="button"
            onClick={handleVerifyNow}
            className="w-full inline-flex items-center justify-center gap-2 rounded-2xl bg-[#1a1918] py-3.5 px-4 text-sm font-bold text-white shadow-md transition hover:bg-orange-600 active:scale-[0.99] cursor-pointer"
          >
            <span>Verify email now</span>
            <ArrowRight className="size-4" />
          </button>

          <button
            type="button"
            onClick={onClose}
            className="w-full inline-flex items-center justify-center rounded-2xl border border-[#e4ded5] bg-white py-3 px-4 text-xs font-semibold text-[#55504b] transition hover:bg-[#f7f5f2] active:scale-[0.99] cursor-pointer"
          >
            Use a different email
          </button>
        </div>
      </div>
    </div>
  );
}

interface UnverifiedAccountBannerProps {
  email: string;
  onOpenDialog?: () => void;
}

export function UnverifiedAccountBanner({
  email,
  onOpenDialog,
}: UnverifiedAccountBannerProps) {
  const navigate = useNavigate();

  const handleVerify = () => {
    navigate("/verify-email", { state: { email } });
  };

  return (
    <div className="mt-3 rounded-2xl border border-[#e4ded5] bg-white p-4 shadow-xs text-left transition">
      <div className="flex items-start gap-3">
        <div className="grid size-9 shrink-0 place-items-center rounded-xl bg-orange-50 border border-orange-100 text-orange-600">
          <Mail className="size-4" />
        </div>
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-2">
            <span className="inline-flex items-center gap-1 rounded-full border border-orange-200/60 bg-orange-50 px-2 py-0.5 font-mono text-[9px] font-bold uppercase tracking-wider text-orange-600">
              <span className="size-1 rounded-full bg-orange-500 animate-pulse" />
              Unverified Account
            </span>
          </div>
          <p className="mt-1 text-xs font-semibold text-[#1a1918]">
            Your account exists but isn't verified yet.
          </p>
          <p className="mt-0.5 text-[11px] text-[#77736e] leading-relaxed">
            Enter the 6-digit code sent to your email to activate it.
          </p>

          <div className="mt-2.5 flex items-center gap-3">
            <button
              type="button"
              onClick={handleVerify}
              className="inline-flex items-center gap-1.5 rounded-xl bg-[#1a1918] px-3 py-1.5 text-xs font-bold text-white transition hover:bg-orange-600 active:scale-[0.99] cursor-pointer"
            >
              <span>Verify email now</span>
              <ArrowRight className="size-3.5" />
            </button>

            {onOpenDialog && (
              <button
                type="button"
                onClick={onOpenDialog}
                className="text-xs font-semibold text-[#77736e] hover:text-[#1a1918] hover:underline cursor-pointer"
              >
                View details
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
