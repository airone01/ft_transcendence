import { fail, type RequestEvent, redirect } from "@sveltejs/kit";
import { verifyPassword } from "@transc/auth";
import { db } from "@transc/db";
import { eq } from "@transc/db/drizzle-orm";
import { users } from "@transc/db/schema";
import { auth, setSessionTokenCookie } from "$lib/server/auth";
import type { Actions } from "./$types";

/* Dev note: The login and register pages could be made much more safe by
 * leveraging formsnap, superforms and zod together, as explained in the Svelte
 * shadcn page for formsnap https://www.shadcn-svelte.com/docs/components/form.
 * This might be worth invisegating. */

export const actions = {
  default: async ({ request, cookies }) => {
    // NOTE: a forged request WILL crash the app here if those are not strings
    // need type verification with zod
    const data = await request.formData();
    const email = data.get("email") as string;
    const password = data.get("password") as string;

    // TODO!!!
    const usersList = await db
      .select()
      .from(users)
      .where(eq(users.email, email));
    if (usersList.length === 0) {
      return fail(400, { message: "Invalid email or password" });
    }
    const existingUser = usersList[0];

    if (!existingUser.password) {
      return fail(400, {
        // TODO: specific message depending on the provider, because this is not precise enough for an average user
        message:
          "This account uses OAuth login. Please sign in with your OAuth provider.",
      });
    }

    const valid = await verifyPassword(existingUser.password, password);
    if (!valid) {
      return fail(400, { message: "Invalid email or password" });
    }

    const { token, expiresAt } = await auth.createSession(existingUser.id);

    setSessionTokenCookie(
      { cookies } as RequestEvent<Record<string, never>, null>,
      token,
      expiresAt,
    );

    throw redirect(302, "/");
  },
} satisfies Actions;
