import type { Handle } from "@sveltejs/kit";
import { sequence } from "@sveltejs/kit/hooks";
import { db } from "@transc/db";
import { chatChannels } from "@transc/db/schema";
import { paraglideMiddleware } from "$lib/paraglide/server";
import {
  auth,
  deleteSessionTokenCookie,
  setSessionTokenCookie,
} from "$lib/server/auth";
import { dbGetStats } from "$lib/server/db-services";

async function ensureGlobalChatExists() {
  try {
    // no need to check then update, we can just ignore on conflict
    await db
      .insert(chatChannels)
      .values({ type: "global" })
      .onConflictDoNothing();
    console.log("🌍 Global chat channel successfully initialized!");
  } catch (error) {
    console.error("Failed to initialize global chat:", error);
  }
}
ensureGlobalChatExists();

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

  event.locals.stats = user != null ? await dbGetStats(user.id) : null;
  event.locals.session = session;
  event.locals.user = user;

  return resolve(event);
};

export const handle = sequence(handleAuth, handleParaglide);
