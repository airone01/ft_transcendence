import type { Server as HTTPServer } from "node:http";
import { Server } from "socket.io";
import { registerBotHandlers, releaseBotGame } from "./handlers/bot";
import { registerChatHandlers } from "./handlers/chat";
import { registerGameHandlers, activeGames } from "./handlers/game";
import { queues, registerMatchmakingHandlers } from "./handlers/matchmaking";
import { registerPresenceHandlers, setUserOffline } from "./handlers/presence";
import { authMiddleware } from "./middleware/auth";
import { startHeartbeat } from "./utils/heartbeat";
import { saveSessionOnDisconnect, restoreSessionOnReconnect } from "./utils/reconnection";

let io: Server;

export function initSocketServer(httpServer: HTTPServer) {
  io = new Server(httpServer, {
    cors: {
      origin: process.env.CLIENT_URL || "http://localhost:5173",
      credentials: true,
    },
    pingTimeout: 60000,
    pingInterval: 25000,
    transports: ["websocket"],
    connectionStateRecovery: {
      maxDisconnectionDuration: 120000,
      skipMiddlewares: false,
    },
  });

  io.use(authMiddleware);
  startHeartbeat(io);

  io.on("connection", async (socket) => {
    const userId = socket.data.userId;
    console.log(`[Socket] User connected: ${userId}`);

    socket.join(`user:${userId}`);

    await restoreSessionOnReconnect(socket, activeGames);
    registerGameHandlers(io, socket);
    registerChatHandlers(io, socket);
    registerPresenceHandlers(io, socket);
    registerMatchmakingHandlers(io, socket);
    registerBotHandlers(io, socket);

    socket.on("heartbeat:pong", () => {});

    socket.on("disconnect", (reason) => {
      console.log(`[Socket] User disconnected: ${userId}, reason: ${reason}`);

      const currentGameId = socket.data.currentGameId;

      if (userId) {
        for (const [mode, queue] of queues.entries()) {
          const index = queue.findIndex((s) => s.data.userId === userId);
          if (index !== -1) {
            queue.splice(index, 1);
            console.log(
              `[Matchmaking] Removed user ${userId} from ${mode} queue on disconnect`,
            );
          }
        }
      }

      if (currentGameId?.startsWith("bot-")) {
        releaseBotGame(currentGameId, io);
        socket.data.currentGameId = null;
      }

      saveSessionOnDisconnect(socket);

      setTimeout(async () => {
        const userSockets = await io.in(`user:${userId}`).fetchSockets();
        if (userSockets.length === 0) {
          setUserOffline(userId);
          io.emit("presence:offline", { userId });
        }
      }, 5000);
    });

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