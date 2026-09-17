import { Navigate, Outlet, useLocation } from "react-router-dom";

const VerifyEmailRoute = () => {
  const location = useLocation();
  const stateEmail = (location.state as { email?: string } | null)?.email;
  const searchEmail = new URLSearchParams(location.search).get("email");
  const email = stateEmail || searchEmail;

  if (!email) {
    return <Navigate to="/signin" replace />;
  }
  return <Outlet />;
};

export default VerifyEmailRoute;
