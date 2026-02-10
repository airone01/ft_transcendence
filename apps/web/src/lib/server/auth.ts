import type { RequestEvent } from "@sveltejs/kit";
import { createAuth } from "@transc/auth";
import { db } from "@transc/db";
import { authSessions, users } from "@transc/db/schema";
import { dev } from "$app/environment";

const SESSION_COOKIE_NAME = "session_token";
const OAUTH_SESSION_COOKIE_NAME = "oauth_state";

export function setSessionTokenCookie(
  event: RequestEvent,
  token: string,
  expiresAt: Date,
) {
  event.cookies.set(SESSION_COOKIE_NAME, token, {
    httpOnly: true,
    sameSite: "lax",
    secure: !dev,
    path: "/",
    expires: expiresAt,
  });
}

export function deleteSessionTokenCookie(event: RequestEvent) {
  event.cookies.set(SESSION_COOKIE_NAME, "", {
    httpOnly: true,
    sameSite: "lax",
    secure: !dev,
    path: "/",
    maxAge: 0,
  });
  event.cookies.set(OAUTH_SESSION_COOKIE_NAME, "", {
    httpOnly: true,
    sameSite: "lax",
    secure: !dev,
    path: "/",
    maxAge: 0,
  });
}

export const auth = createAuth({
  db,
  schema: { users, authSessions },
});
