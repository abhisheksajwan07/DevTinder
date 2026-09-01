import axios from "axios";
import createAuthRefresh from "axios-auth-refresh";
import type { AxiosAuthRefreshRequestConfig } from "axios-auth-refresh";
import { useAuthStore } from "../stores/auth.store";



export const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || "/v1",
  withCredentials: true,
  headers: { "Content-Type": "application/json" },
});

api.interceptors.request.use((config) => {
  const method = config.method?.toLowerCase();
  if (
    !["post", "put", "patch", "delete"].includes(method ?? "") ||
    typeof document === "undefined"
  )
    return config;

  const csrfCookie = document.cookie
    .split("; ")
    .find((cookie) => cookie.startsWith("csrfToken="));
  const csrfToken = csrfCookie?.split("=").slice(1).join("=");
  if (csrfToken)
    config.headers.set("x-csrf-token", decodeURIComponent(csrfToken));

  return config;
});

const refreshAuth = async () => {
  try {
    await api.post(
      "/sessions/refresh",
      {}, // empty body
      { skipAuthRefresh: true } as AxiosAuthRefreshRequestConfig
    );
  } catch (err) {
    useAuthStore.getState().clear();
    throw err;
  }
};

createAuthRefresh(api, refreshAuth, {
  statusCodes: [401],
  deduplicateRefresh: true,
});