import type { Server, Socket } from "socket.io";
import { db } from "@transc/db";
import { game as gameTable } from "@transc/db/schema";

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

      // Create the game in DB
      const [newGame] = await db
        .insert(gameTable)
        .values({
          whiteId: parseInt(player1.data.userId),
          blackId: parseInt(player2.data.userId),
          status: "in_progress",
          startedAt: new Date(),
        })
        .returning();

      const gameId = String(newGame.id);

      // Notify the two players
      player1.emit("matchmaking:matched", { gameId, color: "white" });
      player2.emit("matchmaking:matched", { gameId, color: "black" });
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
