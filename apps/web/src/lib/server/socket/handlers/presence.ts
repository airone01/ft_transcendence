import type { Server, Socket } from "socket.io";
import { dbGetFriendIds } from "$lib/server/db-services";

// In-memory map to track online users
const onlineUsers = new Map<number, { username: string; status: string }>();

export async function registerPresenceHandlers(io: Server, socket: Socket) {
  const userId = socket.data.userId;
  const username = socket.data.username;
  const userIdNum = parseInt(userId, 10);

  // mark user as online
  onlineUsers.set(userIdNum, { username, status: "online" });

  // fetch friend IDs once on connect — used to scope all presence broadcasts
  let friendIds: number[] = [];
  try {
    friendIds = await dbGetFriendIds(userIdNum);
  } catch {
    // non-fatal: presence simply won't broadcast to friends this session
  }

  // notify each friend that this user is now online
  for (const friendId of friendIds) {
    io.to(`user:${friendId}`).emit("presence:online", { userId, username });
  }

  // send list of currently-online friends to the newly connected user
  const onlineFriends = friendIds
    .filter((id) => onlineUsers.has(id))
    .map((id) => {
      const data = onlineUsers.get(id)!;
      return { userId: id, ...data };
    });
  socket.emit("presence:list", onlineFriends);

  // user changes their status — notify friends only
  socket.on(
    "presence:status",
    (data: { status: "online" | "away" | "ingame" }) => {
      const user = onlineUsers.get(userIdNum);
      if (user) {
        user.status = data.status;
        for (const friendId of friendIds) {
          io.to(`user:${friendId}`).emit("presence:status", {
            userId,
            status: data.status,
          });
        }
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
 * Broadcast a presence:offline event to all online friends of the given user.
 * Called from index.ts disconnect handler after confirming no remaining sockets.
 */
export async function broadcastOfflineToFriends(
  io: Server,
  userId: string,
): Promise<void> {
  const userIdNum = parseInt(userId, 10);
  let friendIds: number[] = [];
  try {
    friendIds = await dbGetFriendIds(userIdNum);
  } catch {
    return;
  }
  for (const friendId of friendIds) {
    io.to(`user:${friendId}`).emit("presence:offline", { userId });
  }
}
