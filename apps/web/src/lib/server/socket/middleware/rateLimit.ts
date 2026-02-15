import type { Socket } from "socket.io";

interface RateLimitEntry {
  count: number;
  resetTime: number;
}

const rateLimits = new Map<string, RateLimitEntry>();

const RATE_LIMIT_WINDOW = 1000; // 1 sec
const RATE_LIMIT_MAX = 10; // 10 events per sec

export function checkRateLimit(socket: Socket): boolean {
  const key = socket.id;
  const now = Date.now();

  const entry = rateLimits.get(key);

  if (!entry || now > entry.resetTime) {
    // New window
    rateLimits.set(key, { count: 1, resetTime: now + RATE_LIMIT_WINDOW });
    return true; // OK
  }

  entry.count++;

  if (entry.count > RATE_LIMIT_MAX) {
    socket.emit("error", { message: "Rate limit exceeded" });
    return false; // Blocked
  }

  return true;
}

// Wrapper for handlers: uses checkRateLimit before executing
export function withRateLimit(
  socket: Socket,
  handler: (...args: Record<string, unknown>[]) => void,
): (...args: Record<string, unknown>[]) => void {
  return (...args: Record<string, unknown>[]) => {
    if (checkRateLimit(socket)) {
      handler(...args);
    }
  };
}

// Cleanup periodic old entries
setInterval(() => {
  const now = Date.now();
  for (const [key, entry] of rateLimits.entries()) {
    if (now > entry.resetTime) {
      rateLimits.delete(key);
    }
  }
}, 60000); // Toutes les 60s
