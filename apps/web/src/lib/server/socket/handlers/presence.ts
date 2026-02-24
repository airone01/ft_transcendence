import type { Server, Socket } from "socket.io";

// In-memory map to track online users
const onlineUsers = new Map<number, { username: string; status: string }>();

export function registerPresenceHandlers(io: Server, socket: Socket) {
  const userId = socket.data.userId;
  const username = socket.data.username;

  // Mark user as online
  onlineUsers.set(userId, { username, status: "online" });

  // Broadcast to all that this user is online
  io.emit("presence:online", { userId, username });

  // Send the list of online users to the newly connected user
  socket.emit(
    "presence:list",
    Array.from(onlineUsers.entries()).map(([id, data]) => ({
      userId: id,
      ...data,
    })),
  );

  // User change status
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

  // Cleanup on disconnect (called from index.ts after a delay)
  socket.on("disconnect", () => {
  });
}

// Export for cleanup from index.ts
export function setUserOffline(userId: number) {
  onlineUsers.delete(userId);
}

export function getOnlineUsers() {
  return onlineUsers;
}
