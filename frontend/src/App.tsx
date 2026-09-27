import { Routes, Route, Navigate } from "react-router-dom";
import FooterSection from "./components/landing/FooterSection";
import FeatureSection from "./components/landing/FeatureSection";
import HeroSection from "./components/landing/HeroSection";
import LandingNav from "./components/landing/LandingNav";
import MatchingSection from "./components/landing/MatchingSection";
import DemoSection from "./components/landing/DemoSection";
import AuthPage from "./components/auth/AuthPage";

// App screens
import AppShell from "./components/AppShell";
import OnboardingPage from "./pages/OnboardingPage";
import DiscoverPage from "./pages/DiscoverPage";
import MatchesPage from "./pages/MatchesPage";
// import ChatPage from "./pages/ChatPage";
import SessionsPage from "./pages/SessionsPage";
import ProfilePage from "./pages/ProfilePage";
import SettingsPage from "./pages/SettingsPage";
import PublicProfilePage from "./pages/PublicProfilePage";
import ForgotPasswordPage from "./pages/ForgotPasswordPage";
import ResetPasswordPage from "./pages/ResetPasswordPage";
import VerifyEmailPage from "./pages/VerifyEmailPage";
import ProtectedRoute from "./components/auth/ProtectedRoute";

import { useMe } from "./hooks/auth.hooks";
import { useEffect } from "react";
import { useAuthStore } from "./stores/auth.store";
import OnboardingRoute from "./components/auth/OnBoardingRoute";
import PublicOnlyRoute from "./components/auth/PublicOnlyRoute";
import VerifyEmailRoute from "./components/auth/VerifyEmailRoute";
import { HomeRoute } from "./routes/HomeRoute";
import ChatPage from "./pages/ChatPage";

export function LandingPage() {
  return (
    <main className="relative min-h-screen overflow-hidden bg-[#fdfcfb] text-[#242322] font-sans">
      {/* Background Ambient Glow Orbs */}
      <div className="pointer-events-none absolute -top-40 left-1/2 -z-10 h-125 w-200 -translate-x-1/2 rounded-full bg-linear-to-tr from-amber-200/40 via-orange-100/30 to-transparent blur-3xl animate-pulse-soft" />
      <div className="pointer-events-none absolute top-[35%] -left-40 -z-10 h-112.5 w-112.5 rounded-full bg-linear-to-b from-orange-200/20 to-amber-100/10 blur-3xl" />
      <div className="pointer-events-none absolute bottom-[15%] -right-40 -z-10 h-125 w-[w-125] rounded-full bg-linear-to-bl from-amber-200/25 via-orange-100/20 to-transparent blur-3xl" />

      {/* Subtle Dot Grid Overlay */}
      <div className="pointer-events-none absolute inset-0 -z-10 bg-grid-dots opacity-60 mask-[linear-gradient(to_bottom,white_10%,transparent_90%)]" />

      <LandingNav />
      <HeroSection />
      <FeatureSection />
      <MatchingSection />
      <DemoSection />
      <FooterSection />
    </main>
  );
}

function App() {
  const { data: user, isLoading, isError } = useMe();
  useEffect(() => {
    if (user) {
      useAuthStore.getState().setUser(user);
    }

    // revoked session is an errro reported by /auth/me, clear state of the client so that
    // protected shell can't remain visible with dead sesison
    if (isError) {
      useAuthStore.getState().clear();
    }
  }, [user, isError]);
  if (isLoading) {
    return (
      <main className="relative flex min-h-screen items-center justify-center overflow-hidden bg-[#fdfcfb] text-[#242322]">
        <div className="pointer-events-none absolute inset-0 bg-grid-dots opacity-60 [mask-image:radial-gradient(circle_at_center,black_20%,transparent_80%)]" />

        <div className="relative flex flex-col items-center gap-5 rounded-[30px] border border-[#f1e9e3] bg-white/80 px-8 py-8 shadow-[0_24px_80px_rgba(38,24,14,0.08)] backdrop-blur-sm">
          <div className="flex flex-col items-center text-center">
            <span className="text-2xl font-bold tracking-tight text-[#242322]">
              Dev<span className="text-orange-500">Tinder</span>
            </span>
            <h1 className="mt-1 text-sm font-medium text-[#77736e]">
              Finding your match…
            </h1>
          </div>

          <div className="flex h-10 items-center gap-3 rounded-full border border-orange-100 bg-orange-50/70 px-4 py-2 text-sm text-[#5f514b]">
            <div className="h-4 w-4 shrink-0 animate-spin rounded-full border-2 border-orange-200 border-t-orange-500" />
            <span>Loading your profile...</span>
          </div>
        </div>
      </main>
    );
  }
  return (
    <Routes>
      {/* Public */}
      <Route path="/" element={<HomeRoute />} />

      <Route element={<PublicOnlyRoute />}>
        <Route path="/signin" element={<AuthPage initialMode="signin" />} />
        <Route path="/signup" element={<AuthPage initialMode="signup" />} />
      </Route>

      <Route element={<VerifyEmailRoute />}>
        <Route path="/verify-email" element={<VerifyEmailPage />} />
      </Route>

      {/* Public auth flows */}
      <Route path="/forgot-password" element={<ForgotPasswordPage />} />
      <Route path="/reset-password" element={<ResetPasswordPage />} />

      <Route element={<OnboardingRoute />}>
        <Route path="/onboarding" element={<OnboardingPage />} />
      </Route>

      {/* -- App Routes (authenticated ) -- */}
      <Route element={<ProtectedRoute />}>
        <Route path="/app" element={<AppShell />}>
          <Route index element={<Navigate to="/app/discover" replace />} />
          <Route path="discover" element={<DiscoverPage />} />
          <Route path="matches" element={<MatchesPage />} />
          <Route path="chat" element={<ChatPage />} />
          <Route path="chat/:conversationId" element={<ChatPage />} />
          <Route path="sessions" element={<SessionsPage />} />
          <Route path="profile" element={<ProfilePage />} />
          <Route path="profile/:username" element={<PublicProfilePage />} />
          <Route path="settings" element={<SettingsPage />} />
        </Route>
      </Route>

      {/* ---Fallback ---*/}
      <Route path="*" element={<LandingPage />} />
    </Routes>
  );
}

export default App;
