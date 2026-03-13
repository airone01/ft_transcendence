import { json } from "@sveltejs/kit";
import * as m from "$lib/paraglide/messages";
import {
  DBUserNotFoundError,
  dbGetStats,
  dbGetUser,
} from "$lib/server/db-services";
import { checkHttpRateLimit } from "$lib/server/http-rate-limiter";
import type { RequestHandler } from "./$types";

export const GET: RequestHandler = async ({
  params,
  locals,
  getClientAddress,
}) => {
  if (!locals.user)
    return json({ error: m.api_users_id_unauthorized() }, { status: 401 });

  if (!checkHttpRateLimit(getClientAddress(), 10, "api"))
    return json({ error: m.profile_page_action_too_many_requests() }, { status: 429 });

  const userId = parseInt(params.id, 10);

  if (Number.isNaN(userId))
    return json({ error: m.api_users_id_invalid_userid() }, { status: 400 });

  try {
    const [user, stats] = await Promise.all([
      dbGetUser(userId),
      dbGetStats(userId).catch(() => null),
    ]);

    // not leaking password, email, or heavy avatar blob
    const { password, email, avatar, ...publicUser } = user;

    return json({
      ...publicUser,
      currentElo: stats?.currentElo ?? null,
    });
  } catch (error) {
    if (error instanceof DBUserNotFoundError) {
      return json({ error: m.api_users_id_user_not_found() }, { status: 404 });
    }

    console.error(m.api_users_id_fetch_user_internal_error(), error);
    return json({ error: m.internal_server_error() }, { status: 500 });
  }
};
