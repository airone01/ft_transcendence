import { error, redirect } from "@sveltejs/kit";
import {
  dbGetAchievements,
  dbGetEloHistory,
  dbGetStats,
  dbGetUser,
  dbGetUserGameHistory,
} from "$lib/server/db-services";
import type { UserNoPass } from "../../../../app";
import type { PageServerLoad } from "./$types";

export const load: PageServerLoad = async ({ params, locals }) => {
  const fetchUser = async () => {
    let userId: number | undefined;
    let user: UserNoPass | undefined;

    if (locals.user == null) throw redirect(301, "/");

    if (params.id === "me") {
      userId = locals.user.id;
      user = locals.user ?? undefined;
    } else if (params.id != null) {
      userId = parseInt(params.id, 10);
      const { password, ...dbUser } = await dbGetUser(userId);
      user = { ...dbUser, password: null };
    }

    if (Number.isNaN(userId) || userId == null)
      throw error(400, "Invalid user ID");

    if (!user) throw error(404, "User not found");

    const [stats, games, rawEloHistory, achievements] = await Promise.all([
      dbGetStats(userId),
      dbGetUserGameHistory(userId),
      dbGetEloHistory(userId),
      dbGetAchievements(userId),
    ]);

    const eloHistory = rawEloHistory
      // DB returns descending order; we need ascending for chronological
      .sort((a, b) => a.createdAt.getTime() - b.createdAt.getTime())
      .map((entry) => ({
        date: entry.createdAt,
        elo: entry.elo,
      }));

    return { user, stats, games, eloHistory, achievements };
  };

  return {
    userPromise: fetchUser(),
  };
};
