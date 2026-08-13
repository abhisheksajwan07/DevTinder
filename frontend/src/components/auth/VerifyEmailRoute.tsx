import { Navigate, Outlet, useLocation } from "react-router-dom";

const VerifyEmailRoute = () => {
  const location = useLocation();
  const email = (location.state as { email?: string } | null)?.email;
  if (!email) {
    return <Navigate to="signup" replace />;
  }
  return <Outlet />;
};

export default VerifyEmailRoute;
