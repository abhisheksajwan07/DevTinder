import { getMe } from "../services/auth.api";
import { useQuery } from "@tanstack/react-query";

export const useMe = () => {
  return useQuery({
    queryKey: ["auth", "me"],
    queryFn: getMe,
    retry:false
  });
};
