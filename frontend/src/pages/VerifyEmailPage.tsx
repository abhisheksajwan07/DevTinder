import AuthShowcase from "../components/auth/AuthShowcase";
import VerifyEmailForm from "../components/auth/VerifyEmailForm";

export default function VerifyEmailPage() {
  return (
    <div className="min-h-screen w-full font-sans antialiased grid lg:grid-cols-2 bg-[#121212]">
      {/* LEFT COLUMN: Dark Showcase Section */}
      <AuthShowcase />

      {/* RIGHT COLUMN: Light Cream Auth Section */}
      <div className="flex flex-col justify-between p-8 sm:p-12 lg:p-16 bg-[#f5f2eb] text-[#242322] overflow-y-auto min-h-screen">
        <div className="flex items-center justify-between pb-4 border-b border-[#e4dfd6]">
          <div className="flex items-center gap-2">
            <div className="size-3 rounded-full bg-orange-500 animate-pulse" />
            <span className="font-mono text-xs font-bold tracking-wider uppercase text-[#1a1918]">
              DevTinder Auth
            </span>
          </div>
          <span className="font-mono text-[11px] text-[#77736e]">
            Step 2 of 3 &bull; Email Verification
          </span>
        </div>

        {/* Verification Form */}
        <VerifyEmailForm />

        {/* Footer info */}
        <div className="text-center font-mono text-[10px] text-[#9c958e] pt-4">
          DevTinder &bull; Voyage AI Matcher Enabled
        </div>
      </div>
    </div>
  );
}
