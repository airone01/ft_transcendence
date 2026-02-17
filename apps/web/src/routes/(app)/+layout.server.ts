import { redirect } from "@sveltejs/kit";
import type { LayoutServerLoad } from "./$types";

export const load: LayoutServerLoad = async ({ locals }) => {
  // This layout only runs for pages inside (app)
  if (!locals.user) {
    throw redirect(302, "/");
  }

  return {
    user: locals.user,
  };
};
