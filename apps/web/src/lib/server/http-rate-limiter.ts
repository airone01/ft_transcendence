interface RateLimitEntry {
  count: number;
  resetAt: number;
}

const store = new Map<string, RateLimitEntry>();

const WINDOW_MS = 60_000;

/**
 * Check an IP-based rate limit for a specific endpoint namespace.
 *
 * @param ip   - Client IP address (from `getClientAddress()`)
 * @param max  - Maximum requests allowed per window (default: 10)
 * @param ns   - Endpoint namespace used to isolate counters per route
 *               (e.g. "login", "register", "oauth"). Prevents one endpoint's
 *               traffic from consuming another endpoint's quota.
 */
export function checkHttpRateLimit(
  ip: string,
  max = 10,
  ns = "default",
): boolean {
  const key = `${ns}:${ip}`;
  const now = Date.now();
  const entry = store.get(key);

  if (!entry || now > entry.resetAt) {
    store.set(key, { count: 1, resetAt: now + WINDOW_MS });
    return true;
  }

  entry.count++;

  if (entry.count > max) return false;

  return true;
}

setInterval(() => {
  const now = Date.now();
  for (const [key, entry] of store.entries()) {
    if (now > entry.resetAt) store.delete(key);
  }
}, WINDOW_MS);
