import { dbSendToFriend, dbSendToGame, dbSendToGlobal } from "$lib/server/db-services";
import type { Server, Socket } from "socket.io";

export function registerChatHandlers(io: Server, socket: Socket) {
  const userId = socket.data.userId;
  const username = socket.data.username;

  // ─── Global message ─────────────────────────────────────────────────────

  socket.on("chat:global", async (data: { content: string }) => {
    if (!data.content || data.content.trim().length === 0) {
      return socket.emit("chat:error", { message: "Empty message" });
    }

    const content = data.content.trim();

    try {
      await dbSendToGlobal(userId, content);

      io.emit("chat:global", {
        userId,
        username,
        content,
        timestamp: new Date().toISOString(),
      });
    } catch (error) {
      console.error("Failed to send global message:", error);
      return socket.emit("chat:error", { message: "Failed to send message" });
    }
  });

  // ─── In-game message ────────────────────────────────────────────────────

  socket.on("chat:game", async (data: { gameId: string; content: string }) => {
    const { gameId, content: rawContent } = data;

    if (!rawContent || rawContent.trim().length === 0) {
      return socket.emit("chat:error", { message: "Empty message" });
    }

    const content = rawContent.trim();
    const gameIdNum = parseInt(gameId);

    if (isNaN(gameIdNum)) {
      return socket.emit("chat:error", { message: "Invalid game ID" });
    }

    try {

      await dbSendToGame(userId, gameIdNum, content);

      io.to(`game:${gameId}`).emit("chat:game", {
        userId,
        username,
        content,
        timestamp: new Date().toISOString(),
      });
    } catch (error) {
      console.error("Failed to send game message:", error);
      return socket.emit("chat:error", { message: "Failed to send message" });
    }
  });

  // ─── Friend message (MP) ────────────────────────────────────────────────

  socket.on("chat:friend", async (data: { friendId: number; content: string }) => {
    const { friendId, content: rawContent } = data;

    if (!rawContent || rawContent.trim().length === 0) {
      return socket.emit("chat:error", { message: "Empty message" });
    }

    const content = rawContent.trim();

    try {
      await dbSendToFriend(userId, friendId, content);

      const messageData = {
        userId,
        friendId,
        username,
        content,
        timestamp: new Date().toISOString(),
      };

      io.to(`user:${userId}`).emit("chat:friend", messageData);
      io.to(`user:${friendId}`).emit("chat:friend", messageData);
    } catch (error) {
      console.error("Failed to send friend message:", error);
      return socket.emit("chat:error", { message: "Failed to send message" });
    }
  });
}