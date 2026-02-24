import type { Server as HTTPServer } from "node:http";
import { Server } from "socket.io";
import { registerGameHandlers } from "./handlers/game";
import { registerMatchmakingHandlers } from "./handlers/matchmaking";
import { registerPresenceHandlers, setUserOffline } from "./handlers/presence";
import { registerChatHandlers } from "./handlers/chat";
import { authMiddleware } from "./middleware/auth";
import { startHeartbeat } from "./utils/heartbeat";
import {
  restoreSessionOnReconnect,
  saveSessionOnDisconnect,
} from "./utils/reconnection";

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
      skipMiddlewares: true,
    },
  });

  // Auth middleware
  io.use(authMiddleware);

  // Run heartbeat
  startHeartbeat(io);

  io.on("connection", (socket) => {
    const userId = socket.data.userId;
    console.log(`[Socket] User connected: ${userId}`);

    // Join personal room
    socket.join(`user:${userId}`);

    // Try to restore a previous session
    restoreSessionOnReconnect(socket);

    // Register handlers
    registerGameHandlers(io, socket);
    registerChatHandlers(io, socket);
    registerPresenceHandlers(io, socket);
    registerMatchmakingHandlers(io, socket);

    // Heartbeat pong
    socket.on("heartbeat:pong", () => {
      // Client responded to ping, connection OK
    });

    // Disconnect
    socket.on("disconnect", (reason) => {
      console.log(`[Socket] User disconnected: ${userId}, reason: ${reason}`);

      // Save session for reconnection
      saveSessionOnDisconnect(socket);

      // Delay before marking offline (allows quick reconnection)
      setTimeout(async () => {
        const userSockets = await io.in(`user:${userId}`).fetchSockets();
        if (userSockets.length === 0) {
          setUserOffline(userId);
          io.emit("presence:offline", { userId });
        }
      }, 5000);
    });

    // Errors
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
