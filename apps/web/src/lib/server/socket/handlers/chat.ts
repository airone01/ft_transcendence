import type { Server, Socket } from "socket.io";
import { db } from "@transc/db";
import { chatMessage } from "@transc/db/schema";

export function registerChatHandlers(io: Server, socket: Socket) {
  const userId = socket.data.userId;

  // Message global
  socket.on("chat:global", async (data: { content: string }) => {
    if (!data.content || data.content.trim().length === 0) {
      return socket.emit("chat:error", { message: "Empty message" });
    }

    // Sauvegarder en DB
    await db.insert(chatMessage).values({
      senderId: parseInt(userId),
      gameId: null, // global = pas de gameId
      content: data.content.trim(),
    });

    // Broadcast à tous
    io.emit("chat:global", {
      userId,
      username: socket.data.username,
      content: data.content.trim(),
      timestamp: new Date().toISOString(),
    });
  });

  // Message dans une partie
  socket.on("chat:game", async (data: { gameId: string; content: string }) => {
    const { gameId, content } = data;

    if (!content || content.trim().length === 0) {
      return socket.emit("chat:error", { message: "Empty message" });
    }

    // Sauvegarder en DB
    await db.insert(chatMessage).values({
      senderId: parseInt(userId),
      gameId: parseInt(gameId),
      content: content.trim(),
    });

    // Broadcast dans la room du jeu
    io.to(`game:${gameId}`).emit("chat:game", {
      userId,
      username: socket.data.username,
      content: content.trim(),
      timestamp: new Date().toISOString(),
    });
  });
}
