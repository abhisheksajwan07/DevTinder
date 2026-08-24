import { api } from "./api";
import type { Match } from "../types/match";

export const getMatches = async (): Promise<Match[]> => {
  const response = await api.get("/matches");
  return response.data.data;
};



