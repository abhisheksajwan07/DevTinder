import AuthShowcase from "../components/auth/AuthShowcase";
import VerifyEmailForm from "../components/auth/VerifyEmailForm";
import BrandLogo from "../components/BrandLogo";

export default function VerifyEmailPage() {
  return (
    <div className="min-h-screen lg:h-screen lg:overflow-hidden w-full font-sans antialiased grid lg:grid-cols-2 bg-[#121212]">
      {/* LEFT COLUMN: Dark Showcase Section */}
      <AuthShowcase />

      {/* RIGHT COLUMN: Light Cream Auth Section */}
      <div className="flex flex-col justify-between p-6 sm:p-10 lg:p-12 xl:p-16 bg-[#f5f2eb] text-[#242322] overflow-y-auto min-h-screen lg:min-h-0 lg:h-full">
        <div className="flex items-center justify-between pb-4 border-b border-[#e4dfd6] shrink-0">
          <div className="flex items-center gap-2.5">
            <BrandLogo textClassName="text-base font-bold text-[#242322]" />
            <span className="border-l border-[#e4dfd6] pl-2 font-mono text-[10px] font-bold tracking-wider text-[#77736e]">
              AUTH
            </span>
          </div>
          <span className="font-mono text-[11px] text-[#77736e]">
            Step 2 of 3 &bull; Email Verification
          </span>
        </div>

        {/* Verification Form */}
        <div className="my-auto py-6">
          <VerifyEmailForm />
        </div>

        {/* Footer info */}
        <div className="text-center font-mono text-[10px] text-[#9c958e] pt-4 shrink-0">
          Dev<span className="text-orange-500">Tinder</span> &bull; Voyage AI
          Matcher Enabled
        </div>
      </div>
    </div>
  );
}
