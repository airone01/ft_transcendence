import type { Server, Socket } from "socket.io";
import {
  DBGameNotFoundError,
  DBPlayersNotFoundError,
  dbGetGame,
  dbGetPlayers,
} from "$lib/server/db-services";
import { GameRoom } from "../rooms/GameRoom";

export const activeGames = new Map<string, GameRoom>();

export function registerGameHandlers(io: Server, socket: Socket) {
  const userId = socket.data.userId;

  // Join a game
  socket.on("game:join", async (data: { gameId: string }) => {
    try {
      const { gameId } = data;

      const game = await dbGetGame(parseInt(gameId, 10));
      const players = await dbGetPlayers(parseInt(gameId, 10));

      if (
        String(players.whitePlayerId) !== userId &&
        String(players.blackPlayerId) !== userId
      ) {
        console.log(
          `[Game] User ${userId} joining as spectator for game ${gameId}`,
        );

        socket.join(`game:${gameId}`);
        socket.data.isSpectator = true;

        let gameRoom = activeGames.get(gameId);
        if (!gameRoom) {
          gameRoom = new GameRoom(gameId, {
            whiteId: String(players.whitePlayerId),
            blackId: String(players.blackPlayerId),
            startedAt: game.startedAt || undefined,
            timeControlSeconds: game.timeControlSeconds,
            incrementSeconds: game.incrementSeconds,
          });
          activeGames.set(gameId, gameRoom);
        }

        socket.emit("game:state", {
          ...gameRoom.getState(),
          isSpectator: true,
        });

        socket.to(`game:${gameId}`).emit("spectator:joined", {
          userId,
          username: socket.data.username,
        });

        return;
      }

      socket.join(`game:${gameId}`);
      socket.data.currentGameId = gameId;
      let gameRoom = activeGames.get(gameId);
      if (!gameRoom) {
        gameRoom = new GameRoom(gameId, {
          whiteId: String(players.whitePlayerId),
          blackId: String(players.blackPlayerId),
          startedAt: game.startedAt || undefined,
          timeControlSeconds: game.timeControlSeconds,
          incrementSeconds: game.incrementSeconds,
        });
        activeGames.set(gameId, gameRoom);

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

      const myColor =
        String(players.whitePlayerId) === userId ? "white" : "black";
      socket.emit("game:state", { ...gameRoom.getState(), myColor });

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

        if (socket.data.isSpectator) {
          return socket.emit("game:error", {
            message: "Spectators cannot move pawn",
          });
        }

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

        if (result.gameOver) {
        const players = await dbGetPlayers(parseInt(gameId, 10));
        let winnerName: string | null = null;
        let winnerColor: "white" | "black" | null = null;
              
        if (result.winner) {
          const sockets = await io.in(`game:${gameId}`).fetchSockets();
          const winnerSocket = sockets.find(s => s.data.userId === result.winner);
          
          winnerName = winnerSocket?.data.username || null;
          winnerColor = String(players.whitePlayerId) === result.winner ? "white" : "black";
        }
        
        io.to(`game:${gameId}`).emit("game:over", {
          winner: winnerColor,
          winnerName: winnerName,
          reason: result.reason,
        });
      
        const socketsToClean = await io.in(`game:${gameId}`).fetchSockets();
        for (const s of socketsToClean) {
          if (!s.data.isSpectator) {
            s.data.currentGameId = null;
          }
        }
      
        activeGames.delete(gameId);
      }
      } catch (error) {
        console.error("Move error:", error);
        socket.emit("game:error", { message: "Invalid move" });
      }
    },
  );

  socket.on("game:offer_draw", (data: { gameId: string }) => {
    if (socket.data.isSpectator) {
      return socket.emit("game:error", {
        message: "Spectators cannot offer draw",
      });
    }
    socket
      .to(`game:${data.gameId}`)
      .emit("game:draw_offered", { from: userId });
  });

  socket.on("game:accept_draw", async (data: { gameId: string }) => {
    if (socket.data.isSpectator) {
      return socket.emit("game:error", {
        message: "Spectators cannot accept draw",
      });
    }
    const gameRoom = activeGames.get(data.gameId);
    if (gameRoom) {
      await gameRoom.endGame("agreement");
      io.to(`game:${data.gameId}`).emit("game:over", {
        winner: null,
        reason: "agreement",
      });

      const sockets = await io.in(`game:${data.gameId}`).fetchSockets();
      for (const s of sockets) {
        if (!s.data.isSpectator) {
          s.data.currentGameId = null;
        }
      }

      activeGames.delete(data.gameId);
    }
  });

  // Resign
  socket.on("game:resign", async (data: { gameId: string }) => {
  if (socket.data.isSpectator) {
    return socket.emit("game:error", { message: "Spectators cannot resign" });
  }
  const gameRoom = activeGames.get(data.gameId);
  if (gameRoom) {
    const winnerUserId = gameRoom.getOpponent(userId);
    
    const players = await dbGetPlayers(parseInt(data.gameId, 10));
    const winnerColor = String(players.whitePlayerId) === winnerUserId ? "white" : "black";
    
    // Récupérer le username du gagnant
    const sockets = await io.in(`game:${data.gameId}`).fetchSockets();
    const winnerSocket = sockets.find(s => s.data.userId === winnerUserId);
    const winnerName = winnerSocket?.data.username || null;
    
    await gameRoom.endGame("resignation", winnerUserId);
    io.to(`game:${data.gameId}`).emit("game:over", {
      winner: winnerColor,
      winnerName: winnerName,
      reason: "resignation",
    });

    const socketsToClean = await io.in(`game:${data.gameId}`).fetchSockets();
    for (const s of socketsToClean) {
      if (!s.data.isSpectator) {
        s.data.currentGameId = null;
      }
    }

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
