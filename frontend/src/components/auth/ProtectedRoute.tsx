import { Navigate, Outlet } from "react-router-dom";
import { useAuthStore } from "../../stores/auth.store";

const ProtectedRoute = () => {
  const user = useAuthStore((state) => state.user);

  if (!user) {
    return <Navigate to="/signin" replace />;
  }
  if (!user.onBoardingComplete) {
    return <Navigate to="/onboarding" replace />;
  }

  return <Outlet />;
};

export default ProtectedRoute;
