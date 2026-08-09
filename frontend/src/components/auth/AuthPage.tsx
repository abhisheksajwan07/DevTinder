import { useState } from "react";
import AuthShowcase from "./AuthShowcase";
import AuthToggle, { AuthMode } from "./AuthToggle";
import SignInForm from "./SignInForm";
import SignUpForm from "./SignUpForm";

interface AuthPageProps {
  initialMode?: AuthMode;
}

export default function AuthPage({ initialMode = "signin" }: AuthPageProps) {
  const [mode, setMode] = useState<AuthMode>(initialMode);
  const [socialStatus, setSocialStatus] = useState<string | null>(null);

  const handleSocialAuth = (provider: string) => {
    setSocialStatus(`Connecting with ${provider}...`);
    setTimeout(() => {
      setSocialStatus(null);
    }, 2000);
  };

  return (
    <div className="min-h-screen w-full font-sans antialiased grid lg:grid-cols-2 bg-[#121212]">
      {/* LEFT COLUMN: Dark Showcase Section */}
      <AuthShowcase />

      {/* RIGHT COLUMN: Light Cream Auth Section */}
      <div className="flex flex-col justify-between p-8 sm:p-12 lg:p-16 bg-[#f5f2eb] text-[#242322] overflow-y-auto">
        {/* Mode Toggle Header */}
        <AuthToggle mode={mode} onSelectMode={setMode} />

        {/* Social Status Notification Toast */}
        {socialStatus && (
          <div className="mx-auto mt-4 w-full max-w-md rounded-xl border border-orange-200 bg-orange-50 px-4 py-3 text-xs font-medium text-orange-800 animate-fade-in">
            {socialStatus}
          </div>
        )}

        {/* Active Form */}
        {mode === "signin" ? (
          <SignInForm
            onSwitchToSignUp={() => setMode("signup")}
            onSocialAuth={handleSocialAuth}
          />
        ) : (
          <SignUpForm
            onSwitchToSignIn={() => setMode("signin")}
            onSocialAuth={handleSocialAuth}
          />
        )}

        {/* Footer info */}
        <div className="text-center font-mono text-[10px] text-[#9c958e]">
          DevTinder &bull; Voyage AI Matcher Enabled
        </div>
      </div>
    </div>
  );
}
