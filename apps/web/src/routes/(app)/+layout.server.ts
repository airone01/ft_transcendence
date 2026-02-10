import { redirect } from "@sveltejs/kit";
import type { LayoutServerLoad } from "./$types";

export const load: LayoutServerLoad = async ({ locals, url }) => {
  // This layout only runs for pages inside (app)
  if (!locals.user) {
    // Redirect unauthenticated users to the homepage with the login query param
    throw redirect(302, `/?login=true&redirectTo=${url.pathname}`);
  }

  return {
    user: locals.user,
  };
};
