import { useMutation, useQueryClient } from "@tanstack/react-query";
import {
  connectProfile,
  skipProfile,
  acceptConnection,
  rejectConnection,
} from "../services/swipe.api";
import type { SwipeInput, ConnectionActionInput } from "../types/swipe";
import type { FeedProfile } from "../types/feed";
import type { ConversationListItem } from "../types/chat";

export function useSwipeProfile() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ targetProfileId, action }: SwipeInput) => {
      if (action === "skip") {
        return skipProfile(targetProfileId);
      }
      return connectProfile(targetProfileId);
    },
    onMutate: async ({ targetProfileId }) => {
      // Snapshot previous feed before making changes
      const previousFeed =
        queryClient.getQueryData<FeedProfile[]>(["feed"]) || [];

      // Optimistically remove the profile immediately
      queryClient.setQueryData<FeedProfile[]>(["feed"], (profiles = []) =>
        profiles.filter((p) => p.id !== targetProfileId),
      );

      // Return context for rollback
      return { previousFeed };
    },
    onError: (_error, _variables, context) => {
      // Rollback to previous feed if the backend request fails
      if (context?.previousFeed) {
        queryClient.setQueryData(["feed"], context.previousFeed);
      }
    },
  });
}

export function useRespondConnection() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ targetProfileId, action }: ConnectionActionInput) => {
      if (action === "accept") {
        return acceptConnection(targetProfileId);
      }
      return rejectConnection(targetProfileId);
    },
    onMutate: async ({ targetProfileId }) => {
      // Stop any background refetch from overwriting our optimistic change
      await queryClient.cancelQueries({ queryKey: ["connection-requests"] });

      // Take a snapshot of the current list (so we can restore it on failure)
      const previousRequests = queryClient.getQueryData([
        "connection-requests",
      ]);

      // Optimistically remove the card the user just acted on
      queryClient.setQueryData(["connection-requests"], (old: any[] = []) =>
        old.filter((r) => r.profile.id !== targetProfileId),
      );

      // Return the snapshot — React Query passes this to onError as `context`
      return { previousRequests };
    },
    onError: (_error, _variables, context) => {
      // If the API call failed, put the removed card back
      if (context?.previousRequests) {
        queryClient.setQueryData(
          ["connection-requests"],
          context.previousRequests,
        );
      }
    },

    onSuccess: async () => {
      // Re-sync requests and matches list immediately
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: ["connection-requests"] }),
        queryClient.invalidateQueries({ queryKey: ["matches"] }),
      ]);
      // Note: "user, conversations" is invalidated precisely via the
      // "match:created" WebSocket event when the BullMQ worker creates it.
    },
  });
}
