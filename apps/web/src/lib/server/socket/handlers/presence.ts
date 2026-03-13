import type { Server, Socket } from "socket.io";

// In-memory map to track online users
const onlineUsers = new Map<number, { username: string; status: string }>();

export async function registerPresenceHandlers(io: Server, socket: Socket) {
  const userId = socket.data.userId;
  const username = socket.data.username;
  const userIdNum = parseInt(userId, 10);

  // mark user as online
  onlineUsers.set(userIdNum, { username, status: "online" });

  // user changes their status
  socket.on(
    "presence:status",
    (data: { status: "online" | "away" | "ingame" }) => {
      const user = onlineUsers.get(userIdNum);
      if (user) {
        user.status = data.status;
      }
    },
  );

  // Cleanup on disconnect is handled from index.ts via setUserOffline()
}

// Export for cleanup from index.ts
export function setUserOffline(userId: number) {
  onlineUsers.delete(userId);
}

export function getOnlineUsers() {
  return onlineUsers;
}

/**
 * Called from index.ts disconnect handler after confirming no remaining sockets.
 */
export async function broadcastOfflineToFriends(
  io: Server,
  userId: string,
): Promise<void> {
  // presence broadcasting to friends removed
}
