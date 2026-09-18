import { QueryClient } from "@tanstack/react-query";
import axios from "axios";

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 30_000,
      retry: (failureCount, error) => {
        // A rate-limited request must not be retried immediately. Respect the
        // server's 429 response and give the rate-limit window a chance to
        // recover instead of sending another request right away.
        if (axios.isAxiosError(error) && error.response?.status === 429) {
          return false;
        }

        return failureCount < 1;
      },
      refetchOnWindowFocus: false,
    },
  },
});
