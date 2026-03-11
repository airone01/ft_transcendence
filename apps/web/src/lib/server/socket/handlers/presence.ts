import type { Server, Socket } from "socket.io";
import { dbGetFriendsInfo } from "$lib/server/db-services";

// In-memory map to track online users
const onlineUsers = new Map<number, { username: string; status: string }>();

export function registerPresenceHandlers(io: Server, socket: Socket) {
  const userId = socket.data.userId;
  const username = socket.data.username;

  // mark user as online
  onlineUsers.set(userId, { username, status: "online" });

  // broadcast only to friends that this user is online
  const friends = await dbGetFriendsInfo(userId);
  for (const friend of friends) {
    io.to(`user:${friend.userId}`).emit("presence:online", { userId, username });
  }

  // send list of online friends to the newly connected user
  const onlineFriends = friends
    .filter((f) => onlineUsers.has(f.userId))
    .map((f) => ({ userId: f.userId, ...onlineUsers.get(f.userId)! }));
  socket.emit("presence:list", onlineFriends);

  // user change status
  socket.on(
    "presence:status",
    async (data: { status: "online" | "away" | "ingame" }) => {
      const user = onlineUsers.get(userId);
      if (user) {
        user.status = data.status;
        const updatedFriends = await dbGetFriendsInfo(userId);
        for (const friend of updatedFriends) {
          io.to(`user:${friend.userId}`).emit("presence:status", { userId, status: data.status });
        }
      }
    },
  );

  // Cleanup on disconnect (called from index.ts after a delay)
  socket.on("disconnect", () => {});
}

// Export for cleanup from index.ts
export function setUserOffline(userId: number) {
  onlineUsers.delete(userId);
}

export function getOnlineUsers() {
  return onlineUsers;
}
