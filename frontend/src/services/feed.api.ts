import { FeedProfile } from "../types/feed";
import { api } from "./api";

export const getFeed = async (): Promise<FeedProfile[]> => {
  const res = await api.get("/feed");
  return res.data.data.profiles;
};
