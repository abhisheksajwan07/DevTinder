import { Navigate, Outlet } from "react-router-dom";
import { useAuthStore } from "../../stores/auth.store";

const PublicOnlyRoute = () => {
  const user = useAuthStore((state) => state.user);

  if (user) {
    return <Navigate to="/app/discover" replace />;
  }

  return <Outlet />;
};

export default PublicOnlyRoute;