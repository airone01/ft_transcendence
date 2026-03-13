import type { Server, Socket } from "socket.io";
import {
  DBGameNotFoundError,
  DBPlayersNotFoundError,
  dbGetGame,
  dbGetPlayers,
} from "$lib/server/db-services";
import { checkRateLimit } from "../middleware/rateLimit";
import { GameRoom } from "../rooms/GameRoom";

export const activeGames = new Map<string, GameRoom>();

export function registerGameHandlers(io: Server, socket: Socket) {
  const userId = socket.data.userId;

  socket.on("game:join", async (data: { gameId: string }) => {
    if (!checkRateLimit(socket)) return;
    try {
      const { gameId } = data;

      if (gameId.startsWith("bot-")) {
        return socket.emit("game:error", {
          message: "socket_game_join_bot_error",
        });
      }

      const game = await dbGetGame(parseInt(gameId, 10));
      const players = await dbGetPlayers(parseInt(gameId, 10));

      if (
        String(players.whitePlayerId) !== userId &&
        String(players.blackPlayerId) !== userId
      ) {
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
      }

      // Attach timer listeners if not yet registered (room may have been created by a spectator)
      if (gameRoom.listenerCount("time_tick") === 0) {
        gameRoom.on(
          "time_tick",
          (data: { whiteTimeLeft: number; blackTimeLeft: number }) => {
            io.to(`game:${gameId}`).emit("game:time", data);
          },
        );
        gameRoom.on(
          "timeout",
          async (data: { winner: string; gameId: string }) => {
            activeGames.delete(data.gameId);
            let winnerName: string | null = null;
            let winnerColor: "white" | "black" | null = null;
            if (data.winner) {
              const sockets = await io.in(`game:${data.gameId}`).fetchSockets();
              const winnerSocket = sockets.find(
                (s) => s.data.userId === data.winner,
              );
              winnerName = winnerSocket?.data.username || null;
              winnerColor =
                gameRoom.getWhiteId() === data.winner ? "white" : "black";
            }
            io.to(`game:${data.gameId}`).emit("game:over", {
              winner: winnerColor,
              winnerName,
              reason: "timeout",
            });
          },
        );
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
        return socket.emit("game:error", {
          message: "socket_game_join_game_not_found_error",
        });
      }
      if (error instanceof DBPlayersNotFoundError) {
        return socket.emit("game:error", {
          message: "socket_game_join_user_not_found_error",
        });
      }
      console.error("Failed to join game:", error);
      socket.emit("game:error", {
        message: "socket_game_join_fail_join_error",
      });
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
      if (!checkRateLimit(socket)) return;
      try {
        const { gameId, from, to, promotion } = data;

        const gameRoom = activeGames.get(gameId);

        if (socket.data.isSpectator) {
          return socket.emit("game:error", {
            message: "socket_game_move_spectator_error",
          });
        }

        if (!gameRoom) {
          return socket.emit("game:error", {
            message: "socket_game_move_game_not_found_error",
          });
        }

        if (!gameRoom.isPlayerTurn(userId)) {
          return socket.emit("game:error", {
            message: "socket_game_move_not_your_turn_error",
          });
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
            const winnerSocket = sockets.find(
              (s) => s.data.userId === result.winner,
            );

            winnerName = winnerSocket?.data.username || null;
            winnerColor =
              String(players.whitePlayerId) === result.winner
                ? "white"
                : "black";
          }
          activeGames.delete(gameId);

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
        }
      } catch (error) {
        console.error("Move error:", error);
        socket.emit("game:error", {
          message: "socket_game_move_invalid_move_error",
        });
      }
    },
  );

  socket.on("game:offer_draw", (data: { gameId: string }) => {
    if (!checkRateLimit(socket)) return;
    if (socket.data.isSpectator) {
      return socket.emit("game:error", {
        message: "socket_game_offer_draw_specator_error",
      });
    }
    if (data.gameId !== socket.data.currentGameId) {
      return socket.emit("game:error", {
        message: "socket_game_not_your_game_error",
      });
    }
    const gameRoom = activeGames.get(data.gameId);
    if (!gameRoom) {
      return socket.emit("game:error", {
        message: "socket_game_move_game_not_found_error",
      });
    }
    if (!gameRoom.offerDraw(userId)) {
      return socket.emit("game:error", {
        message: "socket_game_offer_draw_error",
      });
    }
    socket
      .to(`game:${data.gameId}`)
      .emit("game:draw_offered", { from: userId });
  });

  socket.on("game:accept_draw", async (data: { gameId: string }) => {
    if (!checkRateLimit(socket)) return;
    if (socket.data.isSpectator) {
      return socket.emit("game:error", {
        message: "socket_game_accept_draw_specator_error",
      });
    }
    if (data.gameId !== socket.data.currentGameId) {
      return socket.emit("game:error", {
        message: "socket_game_not_your_game_error",
      });
    }
    try {
      const gameRoom = activeGames.get(data.gameId);
      if (gameRoom) {
        if (!gameRoom.acceptDraw(userId)) {
          return socket.emit("game:error", {
            message: "socket_game_accept_draw_no_offer_error",
          });
        }
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
    } catch (error) {
      console.error("Accept draw error:", error);
      activeGames.delete(data.gameId);
      socket.emit("game:error", { message: "Failed to accept draw" });
    }
  });

  socket.on("game:resign", async (data: { gameId: string }) => {
    if (!checkRateLimit(socket)) return;
    if (socket.data.isSpectator) {
      return socket.emit("game:error", {
        message: "socket_game_resign_spectator_error",
      });
    }
    try {
      const gameRoom = activeGames.get(data.gameId);
      if (gameRoom) {
        const winnerUserId = gameRoom.getOpponent(userId);

        const players = await dbGetPlayers(parseInt(data.gameId, 10));
        const winnerColor =
          String(players.whitePlayerId) === winnerUserId ? "white" : "black";

        const sockets = await io.in(`game:${data.gameId}`).fetchSockets();
        const winnerSocket = sockets.find(
          (s) => s.data.userId === winnerUserId,
        );
        const winnerName = winnerSocket?.data.username || null;

        await gameRoom.endGame("resignation", winnerUserId);
        io.to(`game:${data.gameId}`).emit("game:over", {
          winner: winnerColor,
          winnerName: winnerName,
          reason: "resignation",
        });

        const socketsToClean = await io
          .in(`game:${data.gameId}`)
          .fetchSockets();
        for (const s of socketsToClean) {
          if (!s.data.isSpectator) {
            s.data.currentGameId = null;
          }
        }

        activeGames.delete(data.gameId);
      }
    } catch (error) {
      console.error("Resign error:", error);
      activeGames.delete(data.gameId);
      socket.emit("game:error", { message: "Failed to process resignation" });
    }
  });

  socket.on("game:leave", (data: { gameId: string }) => {
    if (!checkRateLimit(socket)) return;
    socket.leave(`game:${data.gameId}`);
    const gameRoom = activeGames.get(data.gameId);
    if (gameRoom) gameRoom.removePlayer(socket);
  });
}
