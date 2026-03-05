import type { Server, Socket } from "socket.io";
import {
  type CreateGameInput,
  dbCreateGame,
  dbStartGame,
} from "$lib/server/db-services";
import { activeGames } from "./game";

// Matchmaking queues
const queues = new Map<string, Socket[]>();

export function registerMatchmakingHandlers(_io: Server, socket: Socket) {
  const userId = socket.data.userId;

  // Join a queue
  socket.on("matchmaking:join", async (data: { mode: string }) => {
    const { mode } = data;

    if (!queues.has(mode)) {
      queues.set(mode, []);
    }

    const queue = queues.get(mode);
    if (!queue) return socket.emit("matchmaking:error, undifined queue");

    for (const [gameId, gameRoom] of activeGames.entries()) {
      if (!gameRoom.isGameOver()) {
        const isPlayer =
          gameRoom.getWhiteId() === userId || gameRoom.getBlackId() === userId;

        if (isPlayer) {
          console.log(
            `[Matchmaking] User ${userId} already has active game ${gameId}`,
          );
          return socket.emit("matchmaking:error", {
            message: "You already have a game in progress",
          });
        }
      }
    }

    const alreadyQueued = Array.from(queues.values()).some((q) =>
      q.some((s) => s.data.userId === userId),
    );
    if (alreadyQueued) {
      return socket.emit("matchmaking:error", { message: "Already in queue" });
    }

    socket.emit("matchmaking:waiting", { mode, position: queue.length + 1 });
    queue.push(socket);

    // If 2 players in the queue -> create the game
    if (queue.length >= 2) {
      const player1 = queue.shift();
      const player2 = queue.shift();
      if (!player1 || !player2)
        return socket.emit("matchmaking:error, undifined player");

      if (player1.data.userId === player2.data.userId) {
        console.log(
          `[Matchmaking] Same user ${player1.data.userId} tried to match with themselves`,
        );

        player1.emit("matchmaking:error", {
          message: "Cannot match with yourself",
        });
        player2.emit("matchmaking:error", {
          message: "Cannot match with yourself",
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
              message: "You already have a game in progress",
            });
            player2.emit("matchmaking:error", {
              message: "Match failed, opponent already in game",
            });
            queue.push(player2);
            return;
          }

          if (
            gameRoom.getWhiteId() === player2.data.userId ||
            gameRoom.getBlackId() === player2.data.userId
          ) {
            player2.emit("matchmaking:error", {
              message: "You already have a game in progress",
            });
            player1.emit("matchmaking:error", {
              message: "Match failed, opponent already in game",
            });
            queue.push(player1);
            return;
          }
        }
      }
      try {
        const gameInput: CreateGameInput = {
          whiteUserId: parseInt(player1.data.userId, 10),
          blackUserId: parseInt(player2.data.userId, 10),
          timeControlSeconds: getTimeControlForMode(mode),
          incrementSeconds: getIncrementForMode(mode),
        };

        const gameId = await dbCreateGame(gameInput);
        await dbStartGame(gameId);

        player1.data.currentGameId = String(gameId);
        player2.data.currentGameId = String(gameId);

        // Notify the two players
        player1.emit("matchmaking:matched", {
          gameId: String(gameId),
          color: "white",
        });
        player2.emit("matchmaking:matched", {
          gameId: String(gameId),
          color: "black",
        });
      } catch (error) {
        console.error("Failed to create game:", error);
        player1.emit("matchmaking:error", { message: "Failed to create game" });
        player2.emit("matchmaking:error", { message: "Failed to create game" });
      }
    }
  });

  // Leave the queue
  socket.on("matchmaking:leave", (data: { mode: string }) => {
    const { mode } = data;
    const queue = queues.get(mode);
    if (queue) {
      const index = queue.findIndex((s) => s.data.userId === userId);
      if (index !== -1) queue.splice(index, 1);
    }
    socket.emit("matchmaking:left", { mode });
  });
}

// ─── Helpers ─────────────────────────────────────────────────────────────────

function getTimeControlForMode(mode: string): number {
  switch (mode) {
    case "blitz":
      return 300; // 5 min
    case "rapid":
      return 900; // 15 min
    default:
      return 600; // 10 min
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
