import axios from "axios";
import { useAuthStore } from "../stores/auth.store";

export const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || "/v1",
  withCredentials: true,
  headers: { "Content-Type": "application/json" },
});

api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      const url = error.config?.url;
      if (!url?.includes("/auth/me")) {
        useAuthStore.getState().clear();
      }
    }
    return Promise.reject(error);
  },
);

