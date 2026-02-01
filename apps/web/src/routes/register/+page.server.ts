import { randomInt } from "node:crypto";
import { fail, type RequestEvent, redirect } from "@sveltejs/kit";
import { hashPassword } from "@transc/auth";
import { db } from "@transc/db";
import { eq } from "@transc/db/drizzle-orm";
import { users } from "@transc/db/schema";
import { auth, setSessionTokenCookie } from "$lib/server/auth";
import type { Actions } from "./$types";

export const actions = {
  default: async ({ request, cookies }) => {
    const data = await request.formData();
    const email = data.get("email") as string;
    // long name so as not to export it by accident
    const unsecuredPassword = data.get("password") as string;

    if (!email || !unsecuredPassword) {
      return fail(400, { message: "Missing fields" });
    }

    const existing = await db
      .select()
      .from(users)
      .where(eq(users.email, email));
    if (existing.length > 0) {
      return fail(400, { message: "Email already registered" });
    }

    const passwordHash = await hashPassword(unsecuredPassword);
    const userId = randomInt(0, 1e6);

    try {
      await db.insert(users).values({
        id: userId,
        email,
        password: passwordHash,
        username: "qsjqskdnqsdqsdsq",
        createdAt: new Date(Date.now() + 1e3 * 60 * 60 * 24 * 30),
      });

      const { token, expiresAt } = await auth.createSession(userId);

      setSessionTokenCookie(
        { cookies } as RequestEvent<Record<string, never>, null>,
        token,
        expiresAt,
      );
    } catch (e) {
      console.error(e);
      return fail(500, { message: "Database error" });
    }

    throw redirect(302, "/");
  },
} satisfies Actions;
