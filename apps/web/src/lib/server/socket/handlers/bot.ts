import type { Server, Socket } from "socket.io";
import { parseFEN } from "$lib/chess";
import { findBestMoveTimed } from "../../chessBot/internal/bot/main";
import { GameRoom } from "../rooms/GameRoom";
import { activeGames } from "./game";

const BOT_USER_ID = "0";

function coordsToAlgebraic(coords: [number, number]): string {
  const files = ["a", "b", "c", "d", "e", "f", "g", "h"];
  const ranks = ["8", "7", "6", "5", "4", "3", "2", "1"];
  return files[coords[1]] + ranks[coords[0]];
}

export function registerBotHandlers(_io: Server, socket: Socket) {
  const userId = socket.data.userId;

  socket.on("bot:start", async (_data: { difficulty: string }) => {
    try {
      const gameId = `bot-${userId}-${Date.now()}`;

      const gameRoom = new GameRoom(gameId, {
        whiteId: userId,
        blackId: BOT_USER_ID,
        timeControlSeconds: 600,
        incrementSeconds: 5,
        startedAt: new Date(),
      });

      activeGames.set(gameId, gameRoom);

      gameRoom.on(
        "time_tick",
        (data: { whiteTimeLeft: number; blackTimeLeft: number }) => {
          socket.emit("game:time", data);
        },
      );

      gameRoom.on("timeout", (data: { winner: string; gameId: string }) => {
        socket.emit("game:over", {
          winner: data.winner === userId ? "white" : "black",
          winnerName: data.winner === userId ? socket.data.username : "Bot",
          reason: "timeout",
          eloChange: null,
        });
        activeGames.delete(data.gameId);
      });

      socket.join(`game:${gameId}`);
      socket.data.currentGameId = gameId;

      setTimeout(() => {
        socket.emit("game:state", {
          ...gameRoom.getState(),
          myColor: "white",
          isBotGame: true,
        });
      }, 500);

      console.log(`[Bot] Game ${gameId} created for user ${userId}`);
    } catch (error) {
      console.error("[Bot] Failed to create game:", error);
      socket.emit("game:error", { message: "Failed to start bot game" });
    }
  });

  socket.on("bot:quit", (data: { gameId: string }) => {
    const { gameId } = data;

    if (!gameId.startsWith("bot-")) {
      return socket.emit("game:error", { message: "Not a bot game" });
    }

    const gameRoom = activeGames.get(gameId);
    if (gameRoom) {
      gameRoom.stopTimer();
      activeGames.delete(gameId);
      console.log(`[Bot] Game ${gameId} quit by user ${userId}`);
    }

    socket.leave(`game:${gameId}`);
    socket.data.currentGameId = null;

    socket.emit("bot:quit_success");
  });

  socket.on(
    "bot:move",
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

        const result = await gameRoom.makeMove(userId, { from, to, promotion });

        if (!result.valid) {
          return socket.emit("game:error", { message: result.error });
        }

        socket.emit("game:move", {
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
          socket.emit("game:over", {
            winner: result.winner === userId ? "white" : "black",
            reason: result.reason,
          });
          activeGames.delete(gameId);
          return;
        }

        // Calcul du coup du bot (synchrone)
        const currentFen = gameRoom.getState().fen;
        const currentGameState = parseFEN(currentFen);
        const botMove = findBestMoveTimed(currentGameState);

        if (botMove) {
          const fromAlgebraic = coordsToAlgebraic(botMove.from);
          const toAlgebraic = coordsToAlgebraic(botMove.to);

          const botResult = await gameRoom.makeMove(BOT_USER_ID, {
            from: fromAlgebraic,
            to: toAlgebraic,
            promotion: botMove.promotion?.toLowerCase(),
          });

          socket.emit("game:move", {
            from: fromAlgebraic,
            to: toAlgebraic,
            promotion: botMove.promotion?.toLowerCase(),
            fen: botResult.fen,
            checkmate: botResult.checkmate,
            stalemate: botResult.stalemate,
            whiteTimeLeft: botResult.whiteTimeLeft,
            blackTimeLeft: botResult.blackTimeLeft,
          });

          if (botResult.gameOver) {
            socket.emit("game:over", {
              winner: botResult.winner === userId ? "white" : "black",
              reason: botResult.reason,
            });
            activeGames.delete(gameId);
          }
        }
      } catch (error) {
        console.error("[Bot] Move error:", error);
        socket.emit("game:error", { message: "Invalid move" });
      }
    },
  );
}
