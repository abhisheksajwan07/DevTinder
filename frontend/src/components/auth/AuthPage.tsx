import { useState } from "react";
import AuthShowcase from "./AuthShowcase";
import AuthToggle, { AuthMode } from "./AuthToggle";
import SignInForm from "./SignInForm";
import SignUpForm from "./SignUpForm";
import { githubOAuth, googleOAuth } from "../../services/oauth.api";

interface AuthPageProps {
  initialMode?: AuthMode;
}

export default function AuthPage({ initialMode = "signin" }: AuthPageProps) {
  const [mode, setMode] = useState<AuthMode>(initialMode);

  const handleSocialAuth = (provider: string) => {
    if (provider === "google") {
      googleOAuth();
    } else {
      githubOAuth();
    }
  };

  return (
    <div className="grid min-h-screen w-full grid-cols-1 bg-[#121212] font-sans antialiased lg:h-screen lg:grid-cols-[minmax(0,0.9fr)_minmax(0,1.1fr)]">
      {/* LEFT COLUMN: Dark Showcase Section */}
      <AuthShowcase />

      {/* RIGHT COLUMN: Light Cream Auth Section */}
      <div className="flex min-h-screen min-w-0 flex-col justify-between overflow-y-auto bg-[#f5f2eb] p-5 text-[#242322] sm:p-8 lg:h-screen lg:min-h-0 lg:p-10 xl:p-12">
        {/* Top Header with Step Indicator */}
        <div className="flex min-w-0 flex-col justify-between gap-3 border-b border-[#e4dfd6] pb-4 sm:flex-row sm:items-center">
          {mode === "signup" ? (
            <div className="flex items-center gap-2">
              <div className="size-3 rounded-full bg-orange-500 animate-pulse" />
              <span className="font-mono text-xs font-bold tracking-wider uppercase text-[#1a1918]">
                Step 1 of 3 &bull; Create Account
              </span>
            </div>
          ) : (
            <div className="flex items-center gap-2">
              <div className="size-3 rounded-full bg-orange-400" />
              <span className="font-mono text-xs font-bold tracking-wider uppercase text-[#1a1918]">
                Welcome Back
              </span>
            </div>
          )}
          <AuthToggle mode={mode} onSelectMode={setMode} />
        </div>

        {/* Active Form */}
        <div className="my-auto py-6">
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
        </div>

        {/* Footer info */}
        <div className="text-center font-mono text-[10px] text-[#9c958e] shrink-0">
          DevTinder &bull; Voyage AI Matcher Enabled
        </div>
      </div>
    </div>
  );
}
