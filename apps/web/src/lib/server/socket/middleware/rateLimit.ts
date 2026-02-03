import type { Socket } from "socket.io";

interface RateLimitEntry {
  count: number;
  resetTime: number;
}

const rateLimits = new Map<string, RateLimitEntry>();

const RATE_LIMIT_WINDOW = 1000; // 1 seconde
const RATE_LIMIT_MAX = 10; // 10 events par seconde

export function checkRateLimit(socket: Socket): boolean {
  const key = socket.id;
  const now = Date.now();

  const entry = rateLimits.get(key);

  if (!entry || now > entry.resetTime) {
    // Nouvelle fenêtre
    rateLimits.set(key, { count: 1, resetTime: now + RATE_LIMIT_WINDOW });
    return true; // OK
  }

  entry.count++;

  if (entry.count > RATE_LIMIT_MAX) {
    socket.emit("error", { message: "Rate limit exceeded" });
    return false; // Bloqué
  }

  return true;
}

// Wrapper pour les handlers : utilise checkRateLimit avant d'exécuter
export function withRateLimit(
  socket: Socket,
  handler: (...args: any[]) => void
): (...args: any[]) => void {
  return (...args: any[]) => {
    if (checkRateLimit(socket)) {
      handler(...args);
    }
  };
}

// Cleanup périodique des anciennes entrées
setInterval(() => {
  const now = Date.now();
  for (const [key, entry] of rateLimits.entries()) {
    if (now > entry.resetTime) {
      rateLimits.delete(key);
    }
  }
}, 60000); // Toutes les 60s
