import { api } from "./api";

export const skipProfile = async (targetProfileId: string) => {
  const { data } = await api.post(`/swipes/${targetProfileId}/skip`);
  return data;
};

export const connectProfile = async (targetProfileId: string) => {
  const { data } = await api.post(`/swipes/${targetProfileId}/connect`);
  return data;
};

export const acceptConnection = async (targetProfileId: string) => {
  const { data } = await api.post(`/swipes/${targetProfileId}/accept`);
  return data;
};

export const rejectConnection = async (targetProfileId: string) => {
  const { data } = await api.post(`/swipes/${targetProfileId}/reject`);
  return data;
};
