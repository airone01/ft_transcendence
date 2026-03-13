import type { Server, Socket } from "socket.io";
import {
  type CreateGameInput,
  dbCreateGame,
  dbStartGame,
} from "$lib/server/db-services";
import { checkRateLimit } from "../middleware/rateLimit";
import { activeGames } from "./game";

export const queues = new Map<string, Socket[]>();

export function registerMatchmakingHandlers(_io: Server, socket: Socket) {
  const userId = socket.data.userId;

  socket.on("matchmaking:join", async (data: { mode: string }) => {
    if (!checkRateLimit(socket)) return;
    const { mode } = data;

    if (!queues.has(mode)) {
      queues.set(mode, []);
    }

    const queue = queues.get(mode);
<<<<<<< donttouch/i18n-save
    if (!queue) return socket.emit("matchmaking:error, undifined queue ");
=======
    if (!queue)
      return socket.emit("matchmaking:error", { message: "undefined queue" });
>>>>>>> main

    for (const [gameId, gameRoom] of activeGames.entries()) {
      if (!gameRoom.isGameOver()) {
        const isPlayer =
          gameRoom.getWhiteId() === userId || gameRoom.getBlackId() === userId;

        if (isPlayer) {
          console.log(
            `[Matchmaking] User ${userId} already has active game ${gameId}`,
          );
          return socket.emit("matchmaking:error", {
            message: "socket_matchmaking_join_active_game_error",
          });
        }
      }
    }

    const alreadyQueued = Array.from(queues.values()).some((q) =>
      q.some((s) => s.data.userId === userId),
    );
    if (alreadyQueued) {
      return socket.emit("matchmaking:error", {
        message: "socket_matchmaking_join_already_queued_error",
      });
    }

    socket.emit("matchmaking:waiting", { mode, position: queue.length + 1 });
    queue.push(socket);

    if (queue.length >= 2) {
      const player1 = queue.shift();
      const player2 = queue.shift();
      if (!player1 || !player2)
        return socket.emit("matchmaking:error", {
          message: "undefined player",
        });

      if (player1.data.userId === player2.data.userId) {
        player1.emit("matchmaking:error", {
          message: "socket_matchmaking_join_match_yourself_error",
        });
        player2.emit("matchmaking:error", {
          message: "socket_matchmaking_join_match_yourself_error",
        });
        return;
      }

      for (const [_, gameRoom] of activeGames.entries()) {
        if (!gameRoom.isGameOver()) {
          if (
            gameRoom.getWhiteId() === player1.data.userId ||
            gameRoom.getBlackId() === player1.data.userId
          ) {
            player1.emit("matchmaking:error", {
              message: "socket_matchmaking_join_active_game_error",
            });
            player2.emit("matchmaking:error", {
              message: "socket_matchmaking_join_oppenent_already_queued_error",
            });
            queue.push(player2);
            return;
          }

          if (
            gameRoom.getWhiteId() === player2.data.userId ||
            gameRoom.getBlackId() === player2.data.userId
          ) {
            player2.emit("matchmaking:error", {
              message: "socket_matchmaking_join_active_game_error",
            });
            player1.emit("matchmaking:error", {
              message: "socket_matchmaking_join_oppenent_already_queued_error",
            });
            queue.push(player1);
            return;
          }
        }
      }

      try {
        const [white, black] =
          Math.random() < 0.5 ? [player1, player2] : [player2, player1];

        const gameInput: CreateGameInput = {
          whiteUserId: parseInt(white.data.userId, 10),
          blackUserId: parseInt(black.data.userId, 10),
          timeControlSeconds: getTimeControlForMode(mode),
          incrementSeconds: getIncrementForMode(mode),
        };

        const gameId = await dbCreateGame(gameInput);
        await dbStartGame(gameId);

        white.data.currentGameId = String(gameId);
        black.data.currentGameId = String(gameId);

        white.emit("matchmaking:matched", {
          gameId: String(gameId),
          color: "white",
        });
        black.emit("matchmaking:matched", {
          gameId: String(gameId),
          color: "black",
        });
      } catch (error) {
        console.error("Failed to create game:", error);
        player1.emit("matchmaking:error", {
          message: "socket_matchmaking_join_failed_to_create_error",
        });
        player2.emit("matchmaking:error", {
          message: "socket_matchmaking_join_failed_to_create_error",
        });
      }
    }
  });

  socket.on("matchmaking:leave", (data: { mode: string }) => {
    if (!checkRateLimit(socket)) return;
    const { mode } = data;
    const queue = queues.get(mode);
    if (queue) {
      const index = queue.findIndex((s) => s.data.userId === userId);
      if (index !== -1) queue.splice(index, 1);
    }
    socket.emit("matchmaking:left", { mode });
  });
}

function getTimeControlForMode(mode: string): number {
  switch (mode) {
    case "blitz":
      return 300;
    case "rapid":
      return 900;
    default:
      return 600;
  }
}

function getIncrementForMode(mode: string): number {
  switch (mode) {
    case "blitz":
      return 2;
    case "rapid":
      return 10;
    default:
      return 5;
  }
}
