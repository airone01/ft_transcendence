import { dbGetLeaderboard, type Leaderboard } from "$lib/server/db-services";
import type { PageServerLoad } from "./$types";

export const load: PageServerLoad = async ({
  locals,
}): Promise<{ leaderboard?: Leaderboard }> => {
  if (locals.user) {
    const leaderboard = await dbGetLeaderboard();
    return { leaderboard };
  }

  return {};
};
