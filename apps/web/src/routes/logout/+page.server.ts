import { redirect } from "@sveltejs/kit";
import { deleteSessionTokenCookie } from "$lib/server/auth";
import { db } from "@transc/db";
import { session } from "@transc/db/schema";
import { eq } from "@transc/db/drizzle-orm";
import type { Actions } from "./$types";

export const actions = {
  default: async ({ locals, cookies }) => {
    if (locals.session) {
      await db.delete(session).where(eq(session.id, locals.session.id));
    }

    deleteSessionTokenCookie({ cookies } as any);

    throw redirect(302, "/login");
  },
} satisfies Actions;
