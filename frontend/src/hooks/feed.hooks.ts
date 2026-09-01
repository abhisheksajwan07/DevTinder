import { useQuery } from "@tanstack/react-query";
import { getFeed } from "../services/feed.api";

export function useFeed() {
  return useQuery({
    queryKey: ["feed"],
    queryFn: getFeed,
    // Keep the feed in memory while navigating between app screens.
    // Manual refetch is still available from the empty-state button.
    staleTime: Infinity,
    refetchOnMount: false,
    refetchOnWindowFocus:false,
    retry: false,
    
    refetchInterval: (query) => {
      
      const error = query.state.error as any;
      if (
        error?.response?.status === 503 &&
        error?.response?.data?.code === "FEED_NOT_READY"
      ) {
        return 2000;
      }
      return false;
    },
  });
}
