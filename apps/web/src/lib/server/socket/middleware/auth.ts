import type { Socket } from "socket.io";
import { m } from "$lib/paraglide/messages";
import { auth } from "$lib/server/auth";

const SESSION_COOKIE_NAME = "session_token";

function parseSessionCookie(cookieHeader: string): string | undefined {
  for (const part of cookieHeader.split(";")) {
    const eqIdx = part.indexOf("=");
    if (eqIdx === -1) continue;
    const key = part.slice(0, eqIdx).trim();
    if (key === SESSION_COOKIE_NAME) {
      return decodeURIComponent(part.slice(eqIdx + 1).trim());
    }
  }
  return undefined;
}

export async function authMiddleware(
  socket: Socket,
  next: (err?: Error) => void,
) {
  const cookieHeader = socket.handshake.headers.cookie ?? "";
  const token = parseSessionCookie(cookieHeader);

  if (!token) {
    return next(new Error(m.socket_middleware_auth_required_error()));
  }

  try {
    const { user } = await auth.validateSession(token);

    if (!user) {
      return next(new Error(m.socket_middleware_auth_user_error()));
    }

    socket.data.userId = String(user.id);
    socket.data.username = user.username;

    next();
  } catch (err) {
    console.error("[Socket Auth] Session validation failed:", err);
    return next(new Error(m.socket_middleware_auth_error()));
  }
}
