import { api } from "./api";
import type { ConnectionRequest } from "../types/connection-request";

export const getConnectionRequests = async (): Promise<ConnectionRequest[]> => {
  const response = await api.get("/swipes/requests");
  return response.data.data;
};
