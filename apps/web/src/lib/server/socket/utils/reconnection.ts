import type { Socket } from "socket.io";
import { dbGetGame } from "$lib/server/db-services";

// Track les sessions des users qui se sont déconnectés
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
 * Sauvegarde l'état de la session avant déconnexion
 */
export function saveSessionOnDisconnect(socket: Socket) {
  const userId = socket.data.userId;
  if (!userId) return;

  // ✅ Récupérer le gameId depuis socket.data (sauvegardé pendant game:join)
  const gameId = socket.data.currentGameId || null;

  console.log(`[Reconnection] DEBUG - currentGameId for user ${userId}: ${gameId}`);

  // Récupérer les rooms actuelles du socket (pour référence)
  const rooms = new Set(socket.rooms);
  rooms.delete(socket.id);

  disconnectedSessions.set(userId, {
    userId,
    rooms,
    disconnectedAt: Date.now(),
    gameId,
  });

  console.log(`[Reconnection] Session saved for user ${userId}${gameId ? ` (game:${gameId})` : " (no game)"}`);
}

/**
 * Restaure la session si le user reconnecte dans le délai
 */
export async function restoreSessionOnReconnect(
  socket: Socket
): Promise<{ restored: boolean; gameId: string | null }> {
  const userId = socket.data.userId;
  if (!userId) return { restored: false, gameId: null };

  const session = disconnectedSessions.get(userId);
  if (!session) {
    console.log(`[Reconnection] DEBUG - No session found for user ${userId}`);
    return { restored: false, gameId: null };
  }

  console.log(`[Reconnection] DEBUG - Session found for user ${userId}:`, {
    rooms: Array.from(session.rooms),
    gameId: session.gameId,
    disconnectedAt: new Date(session.disconnectedAt).toISOString(),
  });

  // Vérifier le délai
  if (Date.now() - session.disconnectedAt > MAX_DISCONNECTION_DURATION) {
    disconnectedSessions.delete(userId);
    console.log(`[Reconnection] Session expired for user ${userId}`);
    return { restored: false, gameId: null };
  }

  // Restaurer les rooms
  console.log(`[Reconnection] DEBUG - Restoring rooms for user ${userId}:`, Array.from(session.rooms));
  for (const room of session.rooms) {
    socket.join(room);
  }

  // ✅ Si gameId, rejoindre la game room
  if (session.gameId) {
    socket.join(`game:${session.gameId}`);
    socket.data.currentGameId = session.gameId;  // Restaurer aussi dans socket.data
    console.log(`[Reconnection] DEBUG - Rejoined game room: game:${session.gameId}`);
  }

  // ✅ Si dans une partie, récupérer l'état depuis la DB
  if (session.gameId) {
    console.log(`[Reconnection] DEBUG - gameId found: ${session.gameId}`);
    
    try {
      const gameIdNum = parseInt(session.gameId);
      console.log(`[Reconnection] DEBUG - Fetching game from DB: ${gameIdNum}`);
      
      const game = await dbGetGame(gameIdNum);
      console.log(`[Reconnection] DEBUG - Game fetched:`, {
        id: game.id,
        fen: game.fen,
        status: game.status,
        result: game.result,
      });

      // Envoyer l'état du jeu depuis la DB
      socket.emit("game:state", {
        gameId: session.gameId,
        fen: game.fen,
        turn: game.fen.split(" ")[1] as "w" | "b",
        isCheckmate: game.status === "finished" && game.result?.includes("win"),
        isDraw: game.status === "finished" && game.result === "draw",
        status: game.status,
        result: game.result,
      });

      console.log(`[Reconnection] Game state sent to user ${userId} for game ${session.gameId}`);
    } catch (error) {
      console.error(`[Reconnection] Failed to load game ${session.gameId}:`, error);
    }
  } else {
    console.log(`[Reconnection] DEBUG - No gameId in session for user ${userId}`);
  }

  disconnectedSessions.delete(userId);
  console.log(`[Reconnection] Session restored for user ${userId}`);
  return { restored: true, gameId: session.gameId };
}

/**
 * Cleanup périodique des sessions expirées
 */
setInterval(() => {
  const now = Date.now();
  for (const [userId, session] of disconnectedSessions.entries()) {
    if (now - session.disconnectedAt > MAX_DISCONNECTION_DURATION) {
      disconnectedSessions.delete(userId);
      console.log(`[Reconnection] Cleaned expired session for user ${userId}`);
    }
  }
}, 30000); // Toutes les 30s