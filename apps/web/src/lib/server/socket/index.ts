import { Server } from 'socket.io';
import type { Server as HTTPServer } from 'http';
import { authMiddleware } from './middleware/auth';
import { registerGameHandlers } from './handlers/game';
import { registerChatHandlers } from './handlers/chat';
import { registerPresenceHandlers } from './handlers/presence';

let io: Server;

export function initSocketServer(HTTPServer: HTTPServer) {
    io = new Server(HTTPServer, {
        cors: {
            origin: process.env.CLIENT_URL || '<http://localhost:5173>',
            credentials: true
        },
        pingTimeout: 60000, //60s before timeout
        pingInterval: 25000, //25s heach ping interval
        transports: ['websocket', 'polling'], //try with websocket first then with polling
        //Reconnexion
        connectionStateRecovery: {
            maxDisconnectionDuration: 120000, // 2min
            skipMiddlewares: true
        }
    });

    io.use(authMiddleware);

    io.on('connection', (socket) => {
        console.log('User connected: ${socket.data.userId}');
        
        //join a room personal user
        socket.join('user:${socket.data.userIs}');

        //register evenement handler
        registerGameHandlers(io, socket);
        registerChatHandlers(io, socket);
        registerPresenceHandlers(io, socket);

        //deconnection
        socket.on('disconnect', (reason) => {
              console.log(`User disconnected: ${socket.data.userId}, reason: ${reason}`);
              handleDisconnection(socket);
            });
        
            // Gestion erreurs
            socket.on('error', (error) => {
              console.error('Socket error:', error);
            });
          });
      
          return io;
        }

        export function getIO(): Server {
          if (!io) {
            throw new Error('Socket.io not initialized');
          }
          return io;
        }

        async function handleDisconnection(socket: any) {
          const userId = socket.data.userId;
        
          // Marquer utilisateur offline après délai
          setTimeout(async () => {
            const userSockets = await io.in(`user:${userId}`).fetchSockets();
            if (userSockets.length === 0) {
              // User vraiment déconnecté (pas d'autre socket)
              await setUserOffline(userId);
              io.emit('user:offline', { userId });
            }
          }, 5000); // 5s de grâce     
}