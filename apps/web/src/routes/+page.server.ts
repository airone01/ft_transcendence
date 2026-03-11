import { dbGetLeaderboard, dbGetUser } from "$lib/server/db-services";
import type { PageServerLoad } from "./$types";

export const load: PageServerLoad = async ({ locals }) => {
  if (locals.user) {
    const leaderboard = await dbGetLeaderboard();

    const userPromises = leaderboard.reduce(
      (acc, player) => {
        acc[player.userId] = dbGetUser(player.userId);
        return acc;
      },
      {} as Record<number, Promise<unknown>>,
    );

    return {
      leaderboard,
      userPromises,
    };
  }

  return {};
};
