import type { Socket } from 'socket.io';
import { verifyToken } from '$lib/server/auth';

export async function authMiddleware(
  socket: Socket,
  next: (err?: Error) => void
) {
  try {
    // Get token from cookie or handshake auth
    const token =
      socket.handshake.auth.token ||
      socket.handshake.headers.cookie?.match(/session=([^;]+)/)?.[1];

    if (!token) {
      return next(new Error('Authentication required'));
    }

    // Verify token
    const user = await verifyToken(token);

    if (!user) {
      return next(new Error('Invalid token'));
    }

    // Attach user data to socket
    socket.data.userId = user.id;
    socket.data.username = user.username;
    socket.data.role = user.role;

    next();
  } catch (error) {
    next(new Error('Authentication failed'));
  }
}
