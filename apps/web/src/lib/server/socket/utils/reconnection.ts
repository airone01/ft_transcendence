import type { Socket } from "socket.io";
import type { GameRoom } from "../rooms/GameRoom";

// Track the session users
const disconnectedSessions = new Map<
  string,
  {
    userId: string;
    rooms: Set<string>;
    disconnectedAt: number;
    gameId: string | null;
  }
>();

const MAX_DISCONNECTION_DURATION = 2 * 60 * 1000; // 2 minutes

/**
 * save the state session before deconnection
 */
export function saveSessionOnDisconnect(socket: Socket) {
  const userId = socket.data.userId;
  if (!userId) return;

  if (socket.data.isSpectator) {
    console.log(
      `[Reconnection] User ${userId} is spectator, not saving session`,
    );
    return;
  }

  const gameId = socket.data.currentGameId || null;

  const rooms = new Set(socket.rooms);
  rooms.delete(socket.id);

  disconnectedSessions.set(userId, {
    userId,
    rooms,
    disconnectedAt: Date.now(),
    gameId,
  });

  console.log(
    `[Reconnection] Session saved for user ${userId}${gameId ? ` (game:${gameId})` : ""}`,
  );
}

/**
 * Restore the session
 * @param activeGames - Gameroom map
 */
export async function restoreSessionOnReconnect(
  socket: Socket,
  activeGames: Map<string, GameRoom>,
): Promise<{ restored: boolean; gameId: string | null }> {
  const userId = socket.data.userId;
  if (!userId) return { restored: false, gameId: null };

  for (const [gameId, gameRoom] of activeGames.entries()) {
    if (!gameRoom.isGameOver()) {
      const isPlayer =
        gameRoom.getWhiteId() === userId || gameRoom.getBlackId() === userId;

      if (isPlayer) {
        console.log(`[Reconnection] User ${userId} has active game ${gameId}`);

        socket.join(`game:${gameId}`);
        socket.data.currentGameId = gameId;
        socket.data.isSpectator = false;

        const myColor = gameRoom.getWhiteId() === userId ? "white" : "black";

        socket.emit("game:state", {
          ...gameRoom.getState(),
          myColor,
        });

        socket.emit("game:reconnected", {
          gameId,
          isSpectator: false,
        });

        console.log(
          `[Reconnection] Restored active game ${gameId} for user ${userId}`,
        );

        const session = disconnectedSessions.get(userId);
        if (session) disconnectedSessions.delete(userId);

        return { restored: true, gameId };
      }
    }
  }

  const session = disconnectedSessions.get(userId);
  if (!session) return { restored: false, gameId: null };

  if (Date.now() - session.disconnectedAt > MAX_DISCONNECTION_DURATION) {
    disconnectedSessions.delete(userId);
    console.log(`[Reconnection] Session expired for user ${userId}`);
    return { restored: false, gameId: null };
  }

  for (const room of session.rooms) {
    socket.join(room);
  }

  if (session.gameId) {
    socket.join(`game:${session.gameId}`);
    socket.data.currentGameId = session.gameId;

    const gameRoom = activeGames.get(session.gameId);
    if (gameRoom) {
      socket.emit("game:state", {
        ...gameRoom.getState(),
        gameId: session.gameId,
      });
      socket.emit("game:reconnected", {
        gameId: session.gameId,
        isSpectator: socket.data.isSpectator || false,
      });
      console.log(
        `[Reconnection] Game state sent from memory for game ${session.gameId}`,
      );
    } else {
      console.log(
        `[Reconnection] GameRoom ${session.gameId} not found in memory`,
      );
    }
  }

  disconnectedSessions.delete(userId);
  console.log(`[Reconnection] Session restored for user ${userId}`);
  return { restored: true, gameId: session.gameId };
}

/**
 * cleanup session expired
 */
setInterval(() => {
  const now = Date.now();
  for (const [userId, session] of disconnectedSessions.entries()) {
    if (now - session.disconnectedAt > MAX_DISCONNECTION_DURATION) {
      disconnectedSessions.delete(userId);
      console.log(`[Reconnection] Cleaned expired session for user ${userId}`);
    }
  }
}, 30000);
