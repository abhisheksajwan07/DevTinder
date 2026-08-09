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
import OnboardingPage from "./app/pages/OnboardingPage";
import DiscoverPage from "./app/pages/DiscoverPage";
import MatchesPage from "./app/pages/MatchesPage";
import ChatPage from "./app/pages/ChatPage";
import SessionsPage from "./app/pages/SessionsPage";
import ProfilePage from "./app/pages/ProfilePage";
import SettingsPage from "./app/pages/SettingsPage";
import PublicProfilePage from "./app/pages/PublicProfilePage";
import ForgotPasswordPage from "./app/pages/ForgotPasswordPage";
import ResetPasswordPage from "./app/pages/ResetPasswordPage";

function LandingPage() {
  return (
    <main className="relative min-h-screen overflow-hidden bg-[#fdfcfb] text-[#242322] font-sans">
      {/* Background Ambient Glow Orbs */}
      <div className="pointer-events-none absolute -top-40 left-1/2 -z-10 h-[500px] w-[800px] -translate-x-1/2 rounded-full bg-gradient-to-tr from-amber-200/40 via-orange-100/30 to-transparent blur-3xl animate-pulse-soft" />
      <div className="pointer-events-none absolute top-[35%] -left-40 -z-10 h-[450px] w-[450px] rounded-full bg-gradient-to-br from-orange-200/20 to-amber-100/10 blur-3xl" />
      <div className="pointer-events-none absolute bottom-[15%] -right-40 -z-10 h-[500px] w-[500px] rounded-full bg-gradient-to-bl from-amber-200/25 via-orange-100/20 to-transparent blur-3xl" />

      {/* Subtle Dot Grid Overlay */}
      <div className="pointer-events-none absolute inset-0 -z-10 bg-grid-dots opacity-60 [mask-image:linear-gradient(to_bottom,white_10%,transparent_90%)]" />

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
  return (
    <Routes>
      {/* --public routes--*/}
      <Route path="/" element={<LandingPage />} />
      <Route path="/signin" element={<AuthPage initialMode="signin" />} />
      <Route path="/signup" element={<AuthPage initialMode="signup" />} />
      <Route path="/forgot-password" element={<ForgotPasswordPage />} />
      <Route path="/reset-password" element={<ResetPasswordPage />} />
      <Route path="/onboarding" element={<OnboardingPage />} />

      {/* -- App Routes (authenticated ) -- */}
      <Route path="/app" element={<AppShell />}>
        <Route index element={<Navigate to="/app/discover" replace />} />
        <Route path="discover" element={<DiscoverPage />} />
        <Route path="matches" element={<MatchesPage />} />
        <Route path="chat" element={<ChatPage />} />
        <Route path="sessions" element={<SessionsPage />} />
        <Route path="profile" element={<ProfilePage />} />
        <Route path="profile/:username" element={<PublicProfilePage />} />
        <Route path="settings" element={<SettingsPage />} />
      </Route>

      {/* ---Fallback ---*/}
      <Route path="*" element={<LandingPage />} />
    </Routes>
  );
}

export default App;

