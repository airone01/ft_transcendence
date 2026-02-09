import type { RequestEvent } from "@sveltejs/kit";
import { db } from "@transc/db";
import { eq } from "@transc/db/drizzle-orm";
import { authSessions } from "@transc/db/schema";
import { deleteSessionTokenCookie } from "$lib/server/auth";
import type { Actions } from "./$types";

export const actions = {
  default: async ({ locals, cookies }) => {
    if (locals.session) {
      await db
        .delete(authSessions)
        .where(eq(authSessions.id, locals.session.id));
    }

    deleteSessionTokenCookie({ cookies } as RequestEvent<
      Record<string, never>,
      null
    >);

    return { success: true };
  },
} satisfies Actions;
