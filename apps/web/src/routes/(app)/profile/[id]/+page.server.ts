import { error, redirect } from "@sveltejs/kit";
import {
  dbGetAchievements,
  dbGetEloHistory,
  dbGetPeakElo,
  dbGetStats,
  dbGetUser,
  dbGetUserGameHistory,
} from "$lib/server/db-services";
import type { UserNoPass } from "../../../../app";
import type { PageServerLoad } from "./$types";
import * as m from "$lib/paraglide/messages";

export const load: PageServerLoad = async ({ params, locals }) => {
  if (locals.user == null) throw redirect(301, "/");

  const fetchUser = async () => {
    let userId: number | undefined;
    let user: UserNoPass | undefined;

    if (params.id === "me") {
      userId = (locals.user as UserNoPass).id;
      user = locals.user ?? undefined;
    } else if (params.id != null) {
      userId = parseInt(params.id, 10);
      const { password, ...dbUser } = await dbGetUser(userId);
      user = { ...dbUser, password: null };
    }

    if (Number.isNaN(userId) || userId == null)
      throw error(400, m.profile_page_fecth_user_invalid_userid());

    if (!user) throw error(404, m.profile_page_fecth_user_not_found());

    const [stats, games, rawEloHistory, achievements, peakElo] =
      await Promise.all([
        dbGetStats(userId),
        dbGetUserGameHistory(userId),
        dbGetEloHistory(userId),
        dbGetAchievements(userId),
        dbGetPeakElo(userId),
      ]);

    const eloHistory = rawEloHistory
      // DB returns descending order; we need ascending for chronological
      .sort((a, b) => a.createdAt.getTime() - b.createdAt.getTime())
      .map((entry) => ({
        date: entry.createdAt,
        elo: entry.elo,
      }));

    return { user, stats, games, eloHistory, achievements, peakElo };
  };

  return {
    userPromise: fetchUser(),
  };
};
