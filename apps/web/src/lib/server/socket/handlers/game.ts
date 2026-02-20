import type { Server, Socket } from "socket.io";
import {
  DBGameNotFoundError,
  DBPlayersNotFoundError,
  dbGetGame,
  dbGetPlayers,
} from "$lib/server/db-services";
import { GameRoom } from "../rooms/GameRoom";

const activeGames = new Map<string, GameRoom>();

export function registerGameHandlers(io: Server, socket: Socket) {
  const userId = socket.data.userId;

  // Join a game
  socket.on("game:join", async (data: { gameId: string }) => {
    try {
      const { gameId } = data;

      const game = await dbGetGame(parseInt(gameId, 10));
      const players = await dbGetPlayers(parseInt(gameId, 10));

      // Vérifier que le userId correspond à un des joueurs
      if (
        String(players.whitePlayerId) !== userId &&
        String(players.blackPlayerId) !== userId
      ) {
        return socket.emit("game:error", { message: "Not authorized" });
      }

      // Join the room
      socket.join(`game:${gameId}`);

      // Create or get GameRoom
      let gameRoom = activeGames.get(gameId);
      if (!gameRoom) {
        gameRoom = new GameRoom(gameId, {
          whiteId: String(players.whitePlayerId),
          blackId: String(players.blackPlayerId),
          fen: game.fen,
          startedAt: game.startedAt || undefined,
          timeControlSeconds: game.timeControlSeconds,
          incrementSeconds: game.incrementSeconds,
        });
        activeGames.set(gameId, gameRoom);

        // Forward timer events to clients
        gameRoom.on(
          "time_tick",
          (data: { whiteTimeLeft: number; blackTimeLeft: number }) => {
            io.to(`game:${gameId}`).emit("game:time", data);
          },
        );
        gameRoom.on("timeout", (data: { winner: string; gameId: string }) => {
          io.to(`game:${data.gameId}`).emit("game:over", {
            winner: data.winner,
            reason: "timeout",
          });
          activeGames.delete(data.gameId);
        });
      }

      gameRoom.addPlayer(socket);

      // Send state with player's color
      const myColor =
        String(players.whitePlayerId) === userId ? "white" : "black";
      socket.emit("game:state", { ...gameRoom.getState(), myColor });

      // Notify opponent
      socket.to(`game:${gameId}`).emit("player:joined", {
        userId,
        username: socket.data.username,
      });
    } catch (error) {
      if (error instanceof DBGameNotFoundError) {
        return socket.emit("game:error", { message: "Game not found" });
      }
      if (error instanceof DBPlayersNotFoundError) {
        return socket.emit("game:error", { message: "Players not found" });
      }
      console.error("Failed to join game:", error);
      socket.emit("game:error", { message: "Failed to join game" });
    }
  });

  // Make a move
  socket.on(
    "game:move",
    async (data: {
      gameId: string;
      from: string;
      to: string;
      promotion?: string;
    }) => {
      try {
        const { gameId, from, to, promotion } = data;

        const gameRoom = activeGames.get(gameId);
        if (!gameRoom) {
          return socket.emit("game:error", { message: "Game not found" });
        }

        if (!gameRoom.isPlayerTurn(userId)) {
          return socket.emit("game:error", { message: "Not your turn" });
        }

        const result = await gameRoom.makeMove(userId, { from, to, promotion });

        if (!result.valid) {
          return socket.emit("game:error", { message: result.error });
        }

        // Broadcast the move
        io.to(`game:${gameId}`).emit("game:move", {
          from,
          to,
          promotion,
          fen: result.fen,
          checkmate: result.checkmate,
          stalemate: result.stalemate,
          whiteTimeLeft: result.whiteTimeLeft,
          blackTimeLeft: result.blackTimeLeft,
        });

        // Game over
        if (result.gameOver) {
          io.to(`game:${gameId}`).emit("game:over", {
            winner: result.winner,
            reason: result.reason,
          });
          activeGames.delete(gameId);
        }
      } catch (error) {
        console.error("Move error:", error);
        socket.emit("game:error", { message: "Invalid move" });
      }
    },
  );

  // Offer draw
  socket.on("game:offer_draw", (data: { gameId: string }) => {
    socket
      .to(`game:${data.gameId}`)
      .emit("game:draw_offered", { from: userId });
  });

  // Accept draw
  socket.on("game:accept_draw", async (data: { gameId: string }) => {
    const gameRoom = activeGames.get(data.gameId);
    if (gameRoom) {
      await gameRoom.endGame("agreement");
      io.to(`game:${data.gameId}`).emit("game:over", {
        winner: null,
        reason: "agreement",
      });
      activeGames.delete(data.gameId);
    }
  });

  // Resign
  socket.on("game:resign", async (data: { gameId: string }) => {
    const gameRoom = activeGames.get(data.gameId);
    if (gameRoom) {
      const winner = gameRoom.getOpponent(userId);
      await gameRoom.endGame("resignation", winner);
      io.to(`game:${data.gameId}`).emit("game:over", {
        winner,
        reason: "resignation",
      });
      activeGames.delete(data.gameId);
    }
  });

  // Leave game
  socket.on("game:leave", (data: { gameId: string }) => {
    socket.leave(`game:${data.gameId}`);
    const gameRoom = activeGames.get(data.gameId);
    if (gameRoom) gameRoom.removePlayer(socket);
  });
}
