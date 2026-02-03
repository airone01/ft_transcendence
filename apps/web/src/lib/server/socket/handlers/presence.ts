import type { Server, Socket } from "socket.io";

// Map en mémoire pour tracker les users online
const onlineUsers = new Map<string, { username: string; status: string }>();

export function registerPresenceHandlers(io: Server, socket: Socket) {
  const userId = socket.data.userId;
  const username = socket.data.username;

  // Marquer user comme online
  onlineUsers.set(userId, { username, status: "online" });

  // Broadcast à tous que cet user est online
  io.emit("presence:online", { userId, username });

  // Envoyer la liste des users online au nouveau connecté
  socket.emit("presence:list", Array.from(onlineUsers.entries()).map(([id, data]) => ({
    userId: id,
    ...data,
  })));

  // User change de statut
  socket.on("presence:status", (data: { status: "online" | "away" | "in-game" }) => {
    const user = onlineUsers.get(userId);
    if (user) {
      user.status = data.status;
      io.emit("presence:status", { userId, status: data.status });
    }
  });

  // Cleanup à la déconnexion (appelé depuis index.ts après délai)
  socket.on("disconnect", () => {
    // On ne supprime pas immédiatement pour permettre la reconnexion
    // La suppression est gérée dans handleDisconnection dans index.ts
  });
}

// Export pour cleanup depuis index.ts
export function setUserOffline(userId: string) {
  onlineUsers.delete(userId);
}

export function getOnlineUsers() {
  return onlineUsers;
}