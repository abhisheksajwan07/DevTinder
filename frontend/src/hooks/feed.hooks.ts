import { useQuery } from "@tanstack/react-query";
import { getFeed } from "../services/feed.api";

export function useFeed() {
  return useQuery({
    queryKey: ["feed"],
    queryFn: getFeed,
    staleTime: 0,
    refetchOnMount: "always",
    refetchOnWindowFocus:false,
    retry: false,
    
    refetchInterval: (query) => {
      
      const error = query.state.error as any;
      if (error?.response?.status === 503) {
        return 2000;
      }
      return false;
    },
  });
}
