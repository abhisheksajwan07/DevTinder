import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { getMyProfile, getPublicProfile, updateMyProfile, type UpdateProfileInput } from "../services/profile.api";

export function useMyProfile() {
  return useQuery({ queryKey: ["profile", "me"], queryFn: getMyProfile });
}

export function usePublicProfile(username?: string) {
  return useQuery({
    queryKey: ["profile", "public", username],
    queryFn: () => getPublicProfile(username!),
    enabled: Boolean(username),
  });
}

export function useUpdateMyProfile() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (input: UpdateProfileInput) => updateMyProfile(input),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["profile", "me"] }),
  });
}
