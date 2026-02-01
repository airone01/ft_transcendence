import { fail, redirect } from "@sveltejs/kit";
import { db } from "@transc/db";
import { users } from "@transc/db/schema";
import { eq } from "@transc/db/drizzle-orm";
import { verifyPassword } from "@transc/auth";
import { auth, setSessionTokenCookie } from "$lib/server/auth";
import type { Actions } from "./$types";

export const actions = {
  default: async ({ request, cookies }) => {
    const data = await request.formData();
    const email = data.get("email") as string;
    const password = data.get("password") as string;

    const usersList = await db
      .select()
      .from(users)
      .where(eq(users.email, email));
    if (usersList.length === 0) {
      return fail(400, { message: "Invalid email or password" });
    }
    const existingUser = usersList[0];

    const valid = await verifyPassword(existingUser.password, password);
    if (!valid) {
      return fail(400, { message: "Invalid email or password" });
    }

    const { token, expiresAt } = await auth.createSession(existingUser.id);

    setSessionTokenCookie({ cookies } as any, token, expiresAt);

    throw redirect(302, "/");
  },
} satisfies Actions;
