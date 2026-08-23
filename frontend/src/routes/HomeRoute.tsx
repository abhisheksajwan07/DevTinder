import { Navigate } from "react-router-dom";
import { useAuthStore } from "../stores/auth.store";
import { LandingPage } from "../App";

export function HomeRoute() {
  const user = useAuthStore((state) => state.user);

  if (!user) {
    return <LandingPage />;
  }
  if (!user.onBoardingComplete) {
    return <Navigate to="/onboarding" replace />;
  }

  return <Navigate to="/app/discover" replace />;
}
