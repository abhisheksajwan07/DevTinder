import { io } from "socket.io-client";

// Socket connects to base server URL (no /v1 prefix — that's only for REST API)
const SOCKET_URL = import.meta.env.VITE_SOCKET_URL || undefined;

export const socket = io(SOCKET_URL, {
  withCredentials: true,
  autoConnect: false,
  transports: ["websocket", "polling"],
});

// Stop reconnecting if the server rejects due to a revoked/expired session.
// This prevents a logged-out user from bouncing back online.
socket.on("connect_error", (err) => {
  const reason = err.message;
  if (
    reason === "SESSION_REVOKED" ||
    reason === "UNAUTHORIZED" ||
    reason === "TOKEN_EXPIRED" ||
    reason === "INVALID_TOKEN"
  ) {
    socket.io.opts.reconnection = false;
    socket.disconnect();
  }
});


