import type { Server, Socket } from "socket.io";
import {
  dbGetPlayers,
  dbSendToFriend,
  dbSendToGame,
  dbSendToGlobal,
} from "$lib/server/db-services";
import { checkRateLimit } from "../middleware/rateLimit";

const MAX_MESSAGE_LENGTH = 1000;

export function registerChatHandlers(io: Server, socket: Socket) {
  const userId = socket.data.userId;
  const username = socket.data.username;

  // ─── Global message ─────────────────────────────────────────────────────

  socket.on("chat:global", async (data: { content: string }) => {
    if (!checkRateLimit(socket)) {
      return socket.emit("chat:error", { message: "rate limit exceed"});
    }

    if (!data.content || data.content.trim().length === 0) {
      return socket.emit("chat:error", { message: "Empty message" });
    }

    const content = data.content.trim();

    if (content.length > MAX_MESSAGE_LENGTH) {
      return socket.emit("chat:error", { message: "Message too long" });
    }

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
    if (!checkRateLimit(socket)) {
      return socket.emit("chat:error", { message: "rate limit exceed"});
    }

    if (!rawContent || rawContent.trim().length === 0) {
      return socket.emit("chat:error", { message: "Empty message" });
    }

    const content = rawContent.trim();

    if (content.length > MAX_MESSAGE_LENGTH) {
      return socket.emit("chat:error", { message: "Message too long" });
    }

    const gameIdNum = parseInt(gameId, 10);

    if (Number.isNaN(gameIdNum)) {
      return socket.emit("chat:error", { message: "Invalid game ID" });
    }

    try {
      const players = await dbGetPlayers(gameIdNum);
      if (
        players.whitePlayerId !== userId &&
        players.blackPlayerId !== userId
      ) {
        return socket.emit("chat:error", { message: "Not your game" });
      }
    } catch {
      return socket.emit("chat:error", { message: "Game not found" });
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

  socket.on(
    "chat:friend",
    async (data: { friendId: number | string; content: string }) => {
      const { friendId, content: rawContent } = data;
      if (!checkRateLimit(socket)) {
          return socket.emit("chat:error", { message: "rate limit exceed"});
      }

      if (!rawContent || rawContent.trim().length === 0) {
        return socket.emit("chat:error", { message: "Empty message" });
      }

      const content = rawContent.trim();

      if (content.length > MAX_MESSAGE_LENGTH) {
        return socket.emit("chat:error", { message: "Message too long" });
      }

      const friendIdNum =
        typeof friendId === "string" ? parseInt(friendId, 10) : friendId;
      const userIdNum =
        typeof userId === "string" ? parseInt(userId, 10) : (userId as number);

      if (Number.isNaN(friendIdNum) || Number.isNaN(userIdNum)) {
        return socket.emit("chat:error", { message: "Invalid user ID" });
      }

      try {
        await dbSendToFriend(userIdNum, friendIdNum, content);

        const messageData = {
          senderId: String(userIdNum),
          receiverId: String(friendIdNum),
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
    },
  );
}
