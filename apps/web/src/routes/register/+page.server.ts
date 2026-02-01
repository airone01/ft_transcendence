import { fail, redirect } from "@sveltejs/kit";
import { db } from "@transc/db";
import { user } from "@transc/db/schema";
import { eq } from "@transc/db/drizzle-orm";
import { hashPassword } from "@transc/auth";
import { auth, setSessionTokenCookie } from "$lib/server/auth";
import type { Actions } from "./$types";

export const actions = {
  default: async ({ request, cookies }) => {
    const data = await request.formData();
    const email = data.get("email") as string;
    const password = data.get("password") as string;

    if (!email || !password) {
      return fail(400, { message: "Missing fields" });
    }

    const existing = await db.select().from(user).where(eq(user.email, email));
    if (existing.length > 0) {
      return fail(400, { message: "Email already registered" });
    }

    const passwordHash = await hashPassword(password);
    const userId = crypto.randomUUID();

    try {
      await db.insert(user).values({
        id: userId,
        email,
        passwordHash,
      });

      const { token, expiresAt } = await auth.createSession(userId);

      setSessionTokenCookie({ cookies } as any, token, expiresAt);
    } catch (e) {
      console.error(e);
      return fail(500, { message: "Database error" });
    }

    throw redirect(302, "/");
  },
} satisfies Actions;
