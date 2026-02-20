import { error, redirect } from "@sveltejs/kit";
import {
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
    } else if (userId != null) {
      userId = parseInt(params.id, 10);

      const { password, ...dbUser } = await dbGetUser(userId);
      user = { ...dbUser, password: null };
    }
    if (Number.isNaN(userId) || userId == null)
      throw error(400, "Invalid user ID");
    if (!user) throw error(404, "User not found");

    const stats = await dbGetStats(userId);
    const games = await dbGetUserGameHistory(userId);
    return { user, stats, games };
  };

  return {
    userPromise: fetchUser(),
  };
};
