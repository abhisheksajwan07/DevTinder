import { useQuery } from "@tanstack/react-query";
import { getMatches } from "../services/matches.api";

export function useMatches() {
  return useQuery({
    queryKey: ["matches"],
    queryFn: getMatches,
    staleTime: 0,
    refetchOnMount: "always",
    retry: false,
  });
}

