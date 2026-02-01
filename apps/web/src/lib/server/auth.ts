import { dev } from "$app/environment";
import type { RequestEvent } from "@sveltejs/kit";
import { createAuth } from "@transc/auth";
import { db } from "@transc/db";
import { user, session } from "@transc/db/schema";

const SESSION_COOKIE_NAME = "auth_session";

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
}

export const auth = createAuth({
  db,
  schema: { user, session },
});
