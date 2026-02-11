import { superValidate } from "sveltekit-superforms";
import { zod } from "sveltekit-superforms/adapters";
import { loginSchema, registerSchema } from "$lib/schemas/auth";
import { profileFormSchema } from "$lib/schemas/settings";
import type { LayoutServerLoad } from "./$types";

export const load: LayoutServerLoad = async ({ locals, cookies }) => {
  const sidebarCookie = cookies.get("sidebar:state");
  const sidebarOpen = sidebarCookie !== "false";

  const [settingsForm, loginForm, registerForm] = await Promise.all([
    superValidate(
      locals.user ? { username: locals.user.username } : {},
      zod(profileFormSchema),
    ),
    superValidate(zod(loginSchema)),
    superValidate(zod(registerSchema)),
  ]);

  // Pass user data and session.
  // We could also fetch more user data like stats or recent games here if the
  // user is logged in.
  return {
    user: locals.user,
    session: locals.session,
    //
    sidebarOpen,
    //
    settingsForm,
    loginForm,
    registerForm,
  };
};
