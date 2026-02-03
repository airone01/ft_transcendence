import type { Server, Socket } from "socket.io";

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

  // Récupérer les rooms actuelles du socket
  const rooms = new Set(socket.rooms);
  rooms.delete(socket.id); // Supprimer la room auto-créée

  // Trouver si dans une game room
  let gameId: string | null = null;
  for (const room of rooms) {
    if (room.startsWith("game:")) {
      gameId = room.replace("game:", "");
      break;
    }
  }

  disconnectedSessions.set(userId, {
    userId,
    rooms,
    disconnectedAt: Date.now(),
    gameId,
  });

  console.log(`[Reconnection] Session saved for user ${userId}`);
}

/**
 * Restaure la session si le user reconnecte dans le délai
 */
export function restoreSessionOnReconnect(socket: Socket): boolean {
  const userId = socket.data.userId;
  if (!userId) return false;

  const session = disconnectedSessions.get(userId);
  if (!session) return false;

  // Vérifier le délai
  if (Date.now() - session.disconnectedAt > MAX_DISCONNECTION_DURATION) {
    disconnectedSessions.delete(userId);
    console.log(`[Reconnection] Session expired for user ${userId}`);
    return false;
  }

  // Restaurer les rooms
  for (const room of session.rooms) {
    socket.join(room);
  }

  disconnectedSessions.delete(userId);
  console.log(`[Reconnection] Session restored for user ${userId}`);
  return true;
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
