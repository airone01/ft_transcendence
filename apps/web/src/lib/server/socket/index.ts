import { Server } from "socket.io";
import type { Server as HTTPServer } from "http";
import { authMiddleware } from "./middleware/auth";
import { registerGameHandlers } from "./handlers/game";
import { registerChatHandlers } from "./handlers/chat";
import { registerPresenceHandlers, setUserOffline } from "./handlers/presence";
import { registerMatchmakingHandlers } from "./handlers/matchmaking";
import { saveSessionOnDisconnect, restoreSessionOnReconnect } from "./utils/reconnection";
import { startHeartbeat } from "./utils/heartbeat";

let io: Server;

export function initSocketServer(httpServer: HTTPServer) {
  io = new Server(httpServer, {
    cors: {
      origin: process.env.CLIENT_URL || "http://localhost:5173",
      credentials: true,
    },
    pingTimeout: 60000,
    pingInterval: 25000,
    transports: ["websocket", "polling"],
    connectionStateRecovery: {
      maxDisconnectionDuration: 120000,
      skipMiddlewares: true,
    },
  });

  // Auth middleware
  io.use(authMiddleware);

  // Démarrer heartbeat
  startHeartbeat(io);

  io.on("connection", (socket) => {
    const userId = socket.data.userId;
    console.log(`[Socket] User connected: ${userId}`);

    // Rejoindre room personnelle
    socket.join(`user:${userId}`);

    // Essayer de restaurer une session précédente
    restoreSessionOnReconnect(socket);

    // Register handlers
    registerGameHandlers(io, socket);
    registerChatHandlers(io, socket);
    registerPresenceHandlers(io, socket);
    registerMatchmakingHandlers(io, socket);

    // Heartbeat pong
    socket.on("heartbeat:pong", () => {
      // Client a répondu au ping, connection OK
    });

    // Déconnexion
    socket.on("disconnect", (reason) => {
      console.log(`[Socket] User disconnected: ${userId}, reason: ${reason}`);

      // Sauvegarder session pour reconnexion
      saveSessionOnDisconnect(socket);

      // Délai avant de marquer offline (permet reconnexion rapide)
      setTimeout(async () => {
        const userSockets = await io.in(`user:${userId}`).fetchSockets();
        if (userSockets.length === 0) {
          setUserOffline(userId);
          io.emit("presence:offline", { userId });
        }
      }, 5000);
    });

    // Erreurs
    socket.on("error", (error) => {
      console.error(`[Socket] Error for user ${userId}:`, error);
    });
  });

  return io;
}

export function getIO(): Server {
  if (!io) throw new Error("Socket.io not initialized");
  return io;
}
