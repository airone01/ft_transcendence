# Security Audit Report — ft_transcendence

**Date:** 2026-03-11
**Auditor:** Claude Code (claude-sonnet-4-6)
**Scope:** Full codebase — `apps/web/src/`, `packages/db/src/`
**Branch audited:** `feat/audit_security`

---

## Scope Coverage

All server-side files were audited:

| Area | Files Reviewed |
|------|---------------|
| Auth (HTTP) | `hooks.server.ts`, `server/auth/core.ts`, `server/auth/index.ts`, `server/auth/crypto.ts` |
| Routes | `login/`, `register/`, `logout/`, `discord/`, `settings/`, `profile/[id]/`, `profile/me/social/`, `chat/`, `chat/[id]/`, `(app)/+layout.server.ts`, `api/users/[id]/` |
| WebSocket | `socket/index.ts`, `middleware/auth.ts`, `middleware/rateLimit.ts`, `handlers/chat.ts`, `handlers/game.ts`, `handlers/matchmaking.ts`, `handlers/bot.ts`, `handlers/presence.ts`, `rooms/GameRoom.ts`, `utils/heartbeat.ts`, `utils/reconnection.ts` |
| Database | `db-services/` (all services), `packages/db/src/schema.ts`, `seed.ts`, `reset.ts` |
| Infrastructure | `Caddyfile`, `docker-compose.prod.yml`, `.env.example` |
| Frontend | All `.svelte` files (global `@html` scan) |

---

## Executive Summary

7 vulnerabilities were identified: **1 Critical**, **6 High**.

No SQL injection, stored XSS, or hardcoded production secrets were found. The database layer uses Drizzle ORM with parameterized queries throughout. Svelte's template engine auto-escapes output and no `{@html}` directives are present.

The single most dangerous issue is a complete WebSocket authentication bypass that undermines the security of all real-time features.

---

## Findings

---

### [CRITICAL-1] WebSocket Authentication Bypass — Identity Spoofing

**OWASP:** A07 — Identification and Authentication Failures
**File:** `apps/web/src/lib/server/socket/middleware/auth.ts:7-15`

#### Description

The WebSocket authentication middleware accepts the caller's `userId` and `username` directly from the client-controlled `socket.handshake.auth` object, with **no server-side session validation**:

```ts
// auth.ts — current (vulnerable)
export async function authMiddleware(socket: Socket, next: (err?: Error) => void) {
  const userId = socket.handshake.auth?.userId;   // ← fully client-supplied
  const username = socket.handshake.auth?.username; // ← fully client-supplied

  if (!userId) {
    return next(new Error("Authentication required"));
  }

  socket.data.userId = String(userId);   // trusted without any DB check
  socket.data.username = username || `Player_${String(userId).slice(0, 4)}`;
  next();
}
```

Any client can open a WebSocket connection claiming to be any `userId`. Because **every downstream handler** (`chat.ts`, `game.ts`, `matchmaking.ts`, `bot.ts`, `presence.ts`, `reconnection.ts`) reads identity exclusively from `socket.data.userId`, this one flaw gives an attacker full impersonation over the entire real-time layer.

Contrast with the correct HTTP auth pattern in `hooks.server.ts:52-73`, which reads the session token from an `HttpOnly` cookie and validates it against the database via `auth.validateSession()`.

#### Impact

- Send chat messages as any user (global, friend, in-game)
- Join, move pieces in, resign, or accept draws in any other user's active game
- Inject fake matchmaking results
- Corrupt ELO ratings and game records for any user
- Spoof presence (online/offline) for any user

#### Fix

Remove the client-supplied identity entirely. Validate the session cookie server-side during handshake:

```ts
import { parse as parseCookies } from "cookie";
import { auth } from "$lib/server/auth";

export async function authMiddleware(socket: Socket, next: (err?: Error) => void) {
  const cookieHeader = socket.handshake.headers.cookie ?? "";
  const cookies = parseCookies(cookieHeader);
  const token = cookies["session_token"];

  if (!token) return next(new Error("Authentication required"));

  const { user } = await auth.validateSession(token);
  if (!user) return next(new Error("Invalid or expired session"));

  socket.data.userId = String(user.id);
  socket.data.username = user.username;
  next();
}
```

The client-side `socket.svelte.ts` must stop sending `auth: { userId, username }` in the connection options.

---

### [HIGH-1] OAuth Account Takeover via Unverified Email Collision

**OWASP:** A07 — Identification and Authentication Failures
**File:** `apps/web/src/routes/(public)/login/discord/callback/+server.ts:95-99`

#### Description

When a Discord OAuth login presents an email that matches an existing local account, the callback automatically links and authenticates as that local user — **without checking whether the Discord account's email is verified**:

```ts
const discordUser: DiscordUser = await userResponse.json();
// discordUser.verified is declared in the interface but NEVER checked

const existingEmailUser = await dbGetUserByEmail(discordUser.email);
if (existingEmailUser) {
  // email match: link accounts and log in automatically
  userId = existingEmailUser.id;
}
```

The `DiscordUser` interface at line 18 declares `verified: boolean`, which Discord returns in the API response, but it is never read.

#### Impact

An attacker who creates (or controls) a Discord account with an unverified email matching a victim's local account email can authenticate as the victim without knowing their password. Discord accounts can have unverified emails in certain states (e.g., after an email change before re-verification).

#### Fix

Reject OAuth flows from accounts with unverified emails **before** the email collision check:

```ts
const discordUser: DiscordUser = await userResponse.json();

if (!discordUser.verified) {
  throw redirect(302, "/?error=unverified_discord_email");
}

// email collision logic below is now safe
```

---

### [HIGH-2] No Brute-Force Protection on Login / Register Endpoints

**OWASP:** A07 — Identification and Authentication Failures
**Files:** `apps/web/src/routes/(public)/login/+page.server.ts`, `register/+page.server.ts`

#### Description

The HTTP login and register form actions have no rate limiting. The existing rate limiter in `socket/middleware/rateLimit.ts` only applies to WebSocket events. An attacker can make unlimited password guesses against any account:

```ts
// login/+page.server.ts — no rate limiting whatsoever
export const actions = {
  default: async ({ request, cookies }) => {
    const form = await superValidate(request, zod(loginSchema));
    // ...
    const user = await dbGetUserByEmail(form.data.email);
    if (!user || !user.password || !(await verifyPassword(user.password, form.data.password)))
      return message(form, m.login_action_default_fail(), { status: 400 });
```

Argon2 slows individual hash checks but does not prevent distributed brute-force attacks.

#### Impact

Any account is vulnerable to password brute-forcing, particularly weaker user-chosen passwords.

#### Fix

Add IP-based rate limiting to both actions. A minimal in-process implementation:

```ts
// lib/server/rate-limiter.ts
const attempts = new Map<string, { count: number; resetAt: number }>();

export function checkLoginRateLimit(ip: string): boolean {
  const now = Date.now();
  const entry = attempts.get(ip);
  if (!entry || now > entry.resetAt) {
    attempts.set(ip, { count: 1, resetAt: now + 60_000 });
    return true;
  }
  if (entry.count >= 10) return false;
  entry.count++;
  return true;
}
```

```ts
// login action
const ip = event.getClientAddress();
if (!checkLoginRateLimit(ip))
  return message(form, "Too many attempts, please wait.", { status: 429 });
```

For production, prefer a Redis-backed limiter to survive restarts and handle multi-instance deployments.

---

### [HIGH-3] Unbounded Chat Message Size — Denial of Service

**OWASP:** A05 — Security Misconfiguration
**Files:** `apps/web/src/lib/server/socket/handlers/chat.ts:14-107`, `packages/db/src/schema.ts:337`

#### Description

All three chat handlers (`chat:global`, `chat:game`, `chat:friend`) check only that messages are non-empty. There is no maximum length validation before writing to the database:

```ts
socket.on("chat:global", async (data: { content: string }) => {
  if (!data.content || data.content.trim().length === 0) {
    return socket.emit("chat:error", { message: "Empty message" });
  }
  // content of unlimited size written to DB
  await dbSendToGlobal(userId, content);
```

This is confirmed at the database schema level — `chatMessages.content` is declared as `text` with no length constraint (`packages/db/src/schema.ts:337`):

```ts
content: text("content").notNull(),   // no maxLength
```

#### Impact

An authenticated user (or anyone, due to CRITICAL-1) can send megabyte-sized messages:
- Exhausting database storage
- Causing high memory allocation on the Node.js process for each message broadcast
- Degrading service for all connected users

The WebSocket rate limiter caps event frequency but not payload size, so an attacker sending 10 × 1MB messages per second is within rate-limit bounds.

#### Fix

Add a server-side content length check in each handler:

```ts
const MAX_CONTENT_LENGTH = 1000; // characters

const content = data.content.trim();
if (content.length > MAX_CONTENT_LENGTH) {
  return socket.emit("chat:error", { message: "Message too long" });
}
```

Also add a `varchar` constraint to the schema column:

```ts
content: varchar("content", { length: 1000 }).notNull(),
```

---

### [HIGH-4] Rate Limiter Bypass via Socket Reconnection

**OWASP:** A05 — Security Misconfiguration
**File:** `apps/web/src/lib/server/socket/middleware/rateLimit.ts:13`

#### Description

The WebSocket rate limiter is keyed by `socket.id` — an ephemeral, randomly generated value assigned per connection:

```ts
export function checkRateLimit(socket: Socket): boolean {
  const key = socket.id;   // ← resets on every new connection
  // ...
}
```

A client can trivially bypass the 10 events/second limit by disconnecting and immediately reconnecting, receiving a fresh `socket.id` with a clean counter.

#### Impact

An attacker can flood the server with chat messages, game moves, and matchmaking events at unlimited rates, bypassing all rate limiting protections.

#### Fix

Key the rate limiter by the authenticated user ID. This requires CRITICAL-1 to be fixed first (so `socket.data.userId` is trustworthy):

```ts
export function checkRateLimit(socket: Socket): boolean {
  const key = socket.data.userId;  // stable across reconnections
  // ...
}
```

---

### [HIGH-5] Avatar File Upload Missing MIME Type Validation

**OWASP:** A03 — Injection
**File:** `apps/web/src/routes/(app)/settings/+page.server.ts:143-150`

#### Description

The avatar upload path validates only file size (< 1 MB via Zod) and that the value is a `File` instance. There is no MIME type or magic-byte validation before the raw bytes are passed to `sharp`:

```ts
// settings/+page.server.ts
if (form.data.avatar instanceof File && form.data.avatar.size > 0) {
  const buffer = await form.data.avatar.arrayBuffer();
  const processedImageBuffer = await sharp(buffer)   // no type check
    .resize(256, 256, { fit: "cover" })
    .webp({ quality: 80 })
    .toBuffer();
```

A client-declared `Content-Type` header is not a reliable signal — it can be set to any value.

#### Impact

A malformed or polyglot file (e.g., a ZIP or script with a forged image header) is passed directly to `sharp`'s native C++ image decoder (libvips). If the installed version of libvips/sharp has known parsing vulnerabilities (e.g., heap buffer overflows when processing malformed image headers), an attacker could trigger them. Additionally, if `sharp` throws an unhandled exception on an unexpected format, it may crash the server process.

#### Fix

Validate the file's actual format from its magic bytes before processing:

```ts
import { fileTypeFromBuffer } from "file-type";

const buffer = Buffer.from(await form.data.avatar.arrayBuffer());
const type = await fileTypeFromBuffer(buffer);
const ALLOWED_MIME = new Set(["image/jpeg", "image/png", "image/gif", "image/webp"]);

if (!type || !ALLOWED_MIME.has(type.mime)) {
  return fail(400, { form, message: "Invalid image format. Only JPEG, PNG, GIF, and WebP are allowed." });
}

const processedImageBuffer = await sharp(buffer)
  .resize(256, 256, { fit: "cover" })
  .webp({ quality: 80 })
  .toBuffer();
```

---

### [HIGH-6] Bot Game Termination Without Ownership Check

**OWASP:** A01 — Broken Access Control
**File:** `apps/web/src/lib/server/socket/handlers/bot.ts:149-159`

#### Description

The `bot:quit` event handler terminates a bot game by ID without verifying that the requesting socket owns that game:

```ts
socket.on("bot:quit", (data: { gameId: string }) => {
  const { gameId } = data;

  if (!gameId.startsWith("bot-")) {
    return socket.emit("game:error", { message: "Not a bot game" });
  }

  releaseBotGame(gameId, io);   // ← terminates any bot game by ID
  socket.leave(`game:${gameId}`);
  socket.data.currentGameId = null;
  socket.emit("bot:quit_success");
});
```

Bot game IDs follow the predictable format `bot-{userId}-{Date.now()}` (line 45). A user's ID is an auto-incrementing integer exposed via the public `GET /api/users/[id]` endpoint. The timestamp component can be estimated within a practical window.

#### Impact

An attacker can terminate any other user's active bot game by:
1. Obtaining the victim's `userId` from the public API
2. Guessing or bruteforcing the timestamp component of the gameId
3. Sending `bot:quit` with the constructed gameId

This resets the game state and removes the game from `activeGames`, causing data loss and a degraded user experience.

#### Fix

Verify the requesting user owns the game before releasing it:

```ts
socket.on("bot:quit", (data: { gameId: string }) => {
  const { gameId } = data;

  if (!gameId.startsWith("bot-")) {
    return socket.emit("game:error", { message: "Not a bot game" });
  }

  // Ownership check: bot gameId is "bot-{userId}-{timestamp}"
  const expectedPrefix = `bot-${socket.data.userId}-`;
  if (!gameId.startsWith(expectedPrefix)) {
    return socket.emit("game:error", { message: "Not your game" });
  }

  releaseBotGame(gameId, io);
  socket.leave(`game:${gameId}`);
  socket.data.currentGameId = null;
  socket.emit("bot:quit_success");
});
```

---

## Summary Table

| ID | Severity | Title | File | Line(s) |
|----|----------|-------|------|---------|
| CRITICAL-1 | **CRITICAL** | WebSocket auth bypass — client-supplied userId trusted without session validation | `socket/middleware/auth.ts` | 7–15 |
| HIGH-1 | **HIGH** | OAuth account takeover via unverified Discord email collision | `login/discord/callback/+server.ts` | 95–99 |
| HIGH-2 | **HIGH** | No brute-force protection on login/register endpoints | `login/+page.server.ts`, `register/+page.server.ts` | — |
| HIGH-3 | **HIGH** | Unbounded chat message size — DoS via DB exhaustion | `socket/handlers/chat.ts`, `packages/db/src/schema.ts` | 14–107, 337 |
| HIGH-4 | **HIGH** | Rate limiter keyed by ephemeral socket.id — trivially bypassed by reconnect | `socket/middleware/rateLimit.ts` | 13 |
| HIGH-5 | **HIGH** | Avatar file upload MIME type not validated before sharp processing | `routes/(app)/settings/+page.server.ts` | 143–150 |
| HIGH-6 | **HIGH** | Bot game termination without ownership check | `socket/handlers/bot.ts` | 149–159 |

---

## Findings NOT Present (Verified Clean)

The following classes of vulnerabilities were checked and **not found**:

- **SQL Injection:** All queries use Drizzle ORM with parameterized bindings. Raw `sql` template tags are used only for static arithmetic/CASE expressions with no user input interpolated.
- **Stored XSS:** Svelte's template engine auto-escapes all output. No `{@html}` directive is present anywhere in the codebase.
- **Hardcoded Secrets:** No API keys, passwords, or tokens in source files. `.env.example` contains only placeholder values.
- **CSRF on HTTP Actions:** SvelteKit form actions use `sameSite: "lax"` cookies, which provides CSRF protection for same-site requests. Custom CSRF tokens are not required for this configuration.
- **Insecure Password Storage:** Passwords are hashed with Argon2 (`crypto.ts:4-6`). Session tokens are stored as SHA-256 hashes server-side.
- **Session Fixation:** Sessions are freshly created on login and destroyed on logout.
- **Plaintext Secrets in Logs:** The Discord OAuth error log at `callback/+server.ts:46-51` logs `code` and `clientId` on error. The `code` is a short-lived one-time-use OAuth code and poses negligible risk in practice, but it could be removed for hygiene.

---

## Recommended Fix Priority

1. **CRITICAL-1** — Fix immediately. It invalidates all other WebSocket security controls.
2. **HIGH-4** — Fix immediately after CRITICAL-1 (depends on validated userId being available in `socket.data`).
3. **HIGH-6** — Fix immediately after CRITICAL-1.
4. **HIGH-1** — Fix before next OAuth-related release.
5. **HIGH-2** — Fix before production launch.
6. **HIGH-3** — Fix before production launch.
7. **HIGH-5** — Fix before production launch.
