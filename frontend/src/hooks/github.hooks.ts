import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { getGitHubProfile, syncGitHub } from "../services/github.api";

export function useGitHubProfile(enabled: boolean) {
  return useQuery({
    queryKey: ["github", "profile"],
    queryFn: getGitHubProfile,
    enabled,
    retry: false,
    // Don't re-fetch on every render — data only changes after an explicit sync.
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
}

export function useSyncGitHub() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: syncGitHub,
    onSuccess: () => {
      // The sync job runs asynchronously in a background worker.
      // Refetching immediately always returns stale data (304 Not Modified).
      // Wait 6 seconds to give the worker a chance to complete first.
      setTimeout(() => {
        queryClient.invalidateQueries({ queryKey: ["github", "profile"] });
      }, 6000);
    },
  });
}
