import { type RequestEvent, redirect } from "@sveltejs/kit";
import { deleteSessionTokenCookie } from "$lib/server/auth";
import { dbDeleteAuthSession } from "$lib/server/db-services";
import type { Actions } from "./$types";

export const actions = {
  default: async ({ locals, cookies }) => {
    if (locals.session) {
      try {
        await dbDeleteAuthSession(locals.session.id);
      } catch (e) {
        console.error(e);
      }
    }

    deleteSessionTokenCookie({ cookies } as RequestEvent<
      Record<string, never>,
      null
    >);

    throw redirect(302, "/");
  },
} satisfies Actions;
