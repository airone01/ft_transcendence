import type { Server, Socket } from "socket.io";

// in-memory map to track online users
const onlineUsers = new Map<string, { username: string; status: string }>();

export function registerPresenceHandlers(io: Server, socket: Socket) {
  const userId = socket.data.userId;
  const username = socket.data.username;

  // mark user as online
  onlineUsers.set(userId, { username, status: "online" });

  // broadcast to all that this user is online
  io.emit("presence:online", { userId, username });

  // send list of online users to the newly connected user
  socket.emit(
    "presence:list",
    Array.from(onlineUsers.entries()).map(([id, data]) => ({
      userId: id,
      ...data,
    })),
  );

  // user change status
  socket.on(
    "presence:status",
    (data: { status: "online" | "away" | "in-game" }) => {
      const user = onlineUsers.get(userId);
      if (user) {
        user.status = data.status;
        io.emit("presence:status", { userId, status: data.status });
      }
    },
  );

  // cleanup on disconnect (called from index.ts after a delay)
  socket.on("disconnect", () => {
    // do not remove immediately to allow reconnection
    // removal is handled in handleDisconnection in index.ts
  });
}

export function setUserOffline(userId: string) {
  onlineUsers.delete(userId);
}

export function getOnlineUsers() {
  return onlineUsers;
}
