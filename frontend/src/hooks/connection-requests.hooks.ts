import { useQuery } from "@tanstack/react-query";
import { getConnectionRequests } from "../services/connection-requests.api";

export function useConnectionRequests() {
  return useQuery({
    queryKey: ["connection-requests"],
    queryFn: getConnectionRequests,
    staleTime: 0,
    refetchOnMount: "always",
    retry: false,
  });
}
