import type { Handle } from "@sveltejs/kit";
import { sequence } from "@sveltejs/kit/hooks";
import { paraglideMiddleware } from "$lib/paraglide/server";
import {
  auth,
  deleteSessionTokenCookie,
  setSessionTokenCookie,
} from "$lib/server/auth";
import { db } from "@transc/db";
import { chatChannels } from "@transc/db/schema";

await db
  .insert(chatChannels)
  .values({
    type: "global",
  })
  .returning();

const handleParaglide: Handle = ({ event, resolve }) =>
  paraglideMiddleware(event.request, ({ request, locale }) => {
    event.request = request;

    return resolve(event, {
      transformPageChunk: ({ html }) =>
        html.replace("%paraglide.lang%", locale),
    });
  });

const handleAuth: Handle = async ({ event, resolve }) => {
  const token = event.cookies.get("session_token") ?? null;

  if (token === null) {
    event.locals.user = null;
    event.locals.session = null;
    return resolve(event);
  }

  const { session, user } = await auth.validateSession(token);

  if (session !== null) {
    setSessionTokenCookie(event, token, session.expiresAt);
  } else {
    deleteSessionTokenCookie(event);
  }

  event.locals.session = session;
  event.locals.user = user;

  return resolve(event);
};

export const handle = sequence(handleAuth, handleParaglide);
