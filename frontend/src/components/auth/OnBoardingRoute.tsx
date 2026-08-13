import { Navigate, Outlet } from "react-router-dom";
import { useAuthStore } from "../../stores/auth.store"


const OnboardingRoute =()=>{
    const user = useAuthStore((state)=>state.user);
    if(!user){
        return <Navigate to="/signin" replace/>
    }
    if(user.onBoardingComplete){
        return <Navigate to ="/app/discover" replace />
    }
    return <Outlet />;
}

export default OnboardingRoute;