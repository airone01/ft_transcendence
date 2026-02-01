import { redirect } from "@sveltejs/kit";
import { deleteSessionTokenCookie } from "$lib/server/auth";
import { db } from "@transc/db";
import { authSessions } from "@transc/db/schema";
import { eq } from "@transc/db/drizzle-orm";
import type { Actions } from "./$types";

export const actions = {
  default: async ({ locals, cookies }) => {
    if (locals.session) {
      await db
        .delete(authSessions)
        .where(eq(authSessions.id, locals.session.id));
    }

    deleteSessionTokenCookie({ cookies } as any);

    throw redirect(302, "/");
  },
} satisfies Actions;
