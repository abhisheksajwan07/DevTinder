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
    if(provider === "google"){
      googleOAuth()
    }
    else{
      githubOAuth()
    }
  };

  return (
    <div className="min-h-screen w-full font-sans antialiased grid lg:grid-cols-2 bg-[#121212]">
      {/* LEFT COLUMN: Dark Showcase Section */}
      <AuthShowcase />

      {/* RIGHT COLUMN: Light Cream Auth Section */}
      <div className="flex flex-col justify-between p-8 sm:p-12 lg:p-16 bg-[#f5f2eb] text-[#242322] overflow-y-auto min-h-screen">
        {/* Top Header with Step Indicator */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-[#e4dfd6]">
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
