import { superValidate } from "sveltekit-superforms";
import { zod } from "sveltekit-superforms/adapters";
import { loginSchema, registerSchema } from "$lib/schemas/auth";
import type { LayoutServerLoad } from "./$types";

/* this +layout.server.ts fetches data for the whole app, whereas
+page.server.ts does for the main page (leaderboard) only */

export const load: LayoutServerLoad = async ({ locals, cookies }) => {
  const sidebarCookie = cookies.get("sidebar:state");
  const sidebarOpen = sidebarCookie !== "false";

  const [loginForm, registerForm] = await Promise.all([
    superValidate(zod(loginSchema)),
    superValidate(zod(registerSchema)),
  ]);

  // Pass user data and session.
  // We could also fetch more user data like stats or recent games here if the
  // user is logged in.
  return {
    user: locals.user,
    stats: locals.stats,
    session: locals.session,
    //
    sidebarOpen,
    //
    loginForm,
    registerForm,
  };
};
