import type { Server, Socket } from "socket.io";
import { dbCreateGame, type CreateGameInput } from "$lib/db-services";

// Matchmaking queues
const queues = new Map<string, Socket[]>();

export function registerMatchmakingHandlers(io: Server, socket: Socket) {
  const userId = socket.data.userId;

  // Join a queue
  socket.on("matchmaking:join", async (data: { mode: string }) => {
    const { mode } = data;

    if (!queues.has(mode)) {
      queues.set(mode, []);
    }

    const queue = queues.get(mode)!;

    // Check if already in a queue
    const alreadyQueued = Array.from(queues.values()).some((q) =>
      q.some((s) => s.data.userId === userId)
    );
    if (alreadyQueued) {
      return socket.emit("matchmaking:error", { message: "Already in queue" });
    }

    socket.emit("matchmaking:waiting", { mode, position: queue.length + 1 });
    queue.push(socket);

    // If 2 players in the queue -> create the game
    if (queue.length >= 2) {
      const player1 = queue.shift()!;
      const player2 = queue.shift()!;

      try {
        const gameInput: CreateGameInput = {
          whiteUserId: parseInt(player1.data.userId),
          blackUserId: parseInt(player2.data.userId),
          timeControlSeconds: getTimeControlForMode(mode),
          incrementSeconds: getIncrementForMode(mode),
        };

        const gameId = await dbCreateGame(gameInput);

        // Notify the two players
        player1.emit("matchmaking:matched", { gameId: String(gameId), color: "white" });
        player2.emit("matchmaking:matched", { gameId: String(gameId), color: "black" });
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
    case "blitz": return 300; // 5 min
    case "rapid": return 900; // 15 min
    case "casual":
    default: return 600; // 10 min
  }
}

function getIncrementForMode(mode: string): number {
  switch (mode) {
    case "blitz": return 2;
    case "rapid": return 10;
    case "casual":
    default: return 5;
  }
}