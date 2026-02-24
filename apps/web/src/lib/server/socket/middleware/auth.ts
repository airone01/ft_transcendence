import type { Socket } from "socket.io";

export async function authMiddleware(
  socket: Socket,
  next: (err?: Error) => void,
) {
  const userId = socket.handshake.auth?.userId;
  const username = socket.handshake.auth?.username;

  if (!userId) {
    return next(new Error("Authentication required"));
  }

  socket.data.userId = String(userId);
  socket.data.username = username || `Player_${String(userId).slice(0, 4)}`;

  next();
}
