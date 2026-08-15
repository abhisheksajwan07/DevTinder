import axios from "axios";
import { useAuthStore } from "../stores/auth.store";

export const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || "/v1",
  withCredentials: true,
  headers: { "Content-Type": "application/json" },
});

api.interceptors.request.use((config) => {
  const method = config.method?.toLowerCase();
  if (!['post', 'put', 'patch', 'delete'].includes(method ?? '') || typeof document === 'undefined') return config;

  const csrfCookie = document.cookie.split('; ').find((cookie) => cookie.startsWith('csrfToken='));
  const csrfToken = csrfCookie?.split('=').slice(1).join('=');
  if (csrfToken) config.headers.set('x-csrf-token', decodeURIComponent(csrfToken));

  return config;
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
