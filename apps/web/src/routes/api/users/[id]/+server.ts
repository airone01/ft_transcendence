import { json } from "@sveltejs/kit";
import {
  DBUserNotFoundError,
  dbGetStats,
  dbGetUser,
} from "$lib/server/db-services";
import type { RequestHandler } from "./$types";

export const GET: RequestHandler = async ({ params, locals }) => {
  const userId = parseInt(params.id, 10);

  if (!locals.user) return json({ error: "Unauthorized" }, { status: 401 });

  if (Number.isNaN(userId))
    return json({ error: "Invalid user ID" }, { status: 400 });

  try {
    const [user, stats] = await Promise.all([
      dbGetUser(userId),
      dbGetStats(userId).catch(() => null),
    ]);

    // not leaking password
    const { password, email, ...publicUser } = user;

    return json({
      ...publicUser,
      currentElo: stats?.currentElo ?? null,
    });
  } catch (error) {
    if (error instanceof DBUserNotFoundError) {
      return json({ error: "User not found" }, { status: 404 });
    }

    console.error("Failed to fetch user profile for HoverCard:", error);
    return json({ error: "Internal Server Error" }, { status: 500 });
  }
};
