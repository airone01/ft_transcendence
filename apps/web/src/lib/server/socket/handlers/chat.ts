import { dbSendToGame, dbSendToGlobal } from "$lib/server/db-services";
import { db } from "@transc/db";
import type { Server, Socket } from "socket.io";

export function registerChatHandlers(io: Server, socket: Socket) {
  const userId = socket.data.userId;

  // Global message
  socket.on("chat:global", async (data: { content: string }) => {
    if (!data.content || data.content.trim().length === 0) {
      return socket.emit("chat:error", { message: "Empty message" });
    }

    dbSendToGlobal(userId, data.content.trim());

    // Broadcast to all
    io.emit("chat:global", {
      userId,
      username: socket.data.username,
      content: data.content.trim(),
      timestamp: new Date().toISOString(),
    });
  });

  // In-game message
  socket.on("chat:game", async (data: { gameId: number; content: string }) => {
    const { gameId, content } = data;

    if (!content || content.trim().length === 0) {
      return socket.emit("chat:error", { message: "Empty message" });
    }

    dbSendToGame(userId, gameId, content.trim());

    // Broadcast to the game room
    io.to(`game:${gameId}`).emit("chat:game", {
      userId,
      username: socket.data.username,
      content: content.trim(),
      timestamp: new Date().toISOString(),
    });
  });
}
