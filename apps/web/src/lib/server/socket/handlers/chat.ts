import type { Server, Socket } from "socket.io";
import { db } from "@transc/db";
import { chatMessage } from "@transc/db/schema";

export function registerChatHandlers(io: Server, socket: Socket) {
  const userId = socket.data.userId;

  // Global message
  socket.on("chat:global", async (data: { content: string }) => {
    if (!data.content || data.content.trim().length === 0) {
      return socket.emit("chat:error", { message: "Empty message" });
    }

    // Save to DB
    await db.insert(chatMessage).values({
      senderId: parseInt(userId),
      gameId: null, // global = no gameId
      content: data.content.trim(),
    });

    // Broadcast to all
    io.emit("chat:global", {
      userId,
      username: socket.data.username,
      content: data.content.trim(),
      timestamp: new Date().toISOString(),
    });
  });

  // In-game message
  socket.on("chat:game", async (data: { gameId: string; content: string }) => {
    const { gameId, content } = data;

    if (!content || content.trim().length === 0) {
      return socket.emit("chat:error", { message: "Empty message" });
    }

    // Save to DB
    await db.insert(chatMessage).values({
      senderId: parseInt(userId),
      gameId: parseInt(gameId),
      content: content.trim(),
    });

    // Broadcast to the game room
    io.to(`game:${gameId}`).emit("chat:game", {
      userId,
      username: socket.data.username,
      content: content.trim(),
      timestamp: new Date().toISOString(),
    });
  });
}
