import type { LayoutServerLoad } from "./$types";

export const load: LayoutServerLoad = async ({ locals, cookies }) => {
  const sidebarCookie = cookies.get("sidebar:state");
  const sidebarOpen = sidebarCookie === "false" ? false : true;

  // pass user data and session.
  // we could also fetch more user data like stats or recent games here if the user is logged in.
  return {
    user: locals.user,
    session: locals.session,
    sidebarOpen,
  };
};
