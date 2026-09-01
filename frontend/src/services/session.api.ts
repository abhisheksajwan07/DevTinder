import { api } from "./api";
import { socket } from "./socket";
import { useAuthStore } from "../stores/auth.store";
import type { Session } from "../types/session";

type ApiResponse<T> = { data: T };

export async function getActiveSessions(): Promise<Session[]> {
  const response = await api.get<ApiResponse<Session[]>>("/sessions");
  return response.data.data;
}

export async function revokeSession(sessionId: string): Promise<void> {
  await api.post(`/sessions/${sessionId}/revoke`);
}

export async function revokeOtherSessions(): Promise<void> {
  await api.post("/sessions/logout-others");
}

export async function logoutCurrentSession(): Promise<void> {
  try {
    await api.post("/sessions/logout");
  } catch {
    // Local cleanup still has to happen if the access session already expired.
  } finally {
    // The backend removes this socket from Redis presence tracking on disconnect.
    socket.disconnect();
    useAuthStore.getState().clear();
  }
}
