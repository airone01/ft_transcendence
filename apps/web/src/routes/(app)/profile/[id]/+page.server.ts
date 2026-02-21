import { error } from "@sveltejs/kit";
import { dbGetUser } from "$lib/server/db-services";
import type { PageServerLoad } from "./$types";

export const load: PageServerLoad = async ({ params, locals }) => {
  const userId = params.id;

  const fetchUser = async () => {
    if (!userId || userId === "me") return locals.user;
    const id = parseInt(userId, 10);
    if (Number.isNaN(id)) throw error(400, "Invalid user ID");
    const user = await dbGetUser(id);
    if (!user) throw error(404, "User not found");
    return user;
  };

  return {
    // pass promise so ui can show loading state
    userPromise: fetchUser(),
  };
};
