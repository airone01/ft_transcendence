import { error } from "@sveltejs/kit";
import { dbGetLeaderboard, dbGetUser } from "$lib/server/db-services";
import type { PageServerLoad } from "./$types";

export const load: PageServerLoad = async ({ locals }) => {
  if (locals.user) {
    try {
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
    } catch (err) {
      console.error("Failed to load leaderboard:", err);
      throw error(500, "Failed to load leaderboard");
    }
  }

  return {};
};
