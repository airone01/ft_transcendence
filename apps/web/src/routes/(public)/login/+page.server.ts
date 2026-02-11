import { fail, type RequestEvent, redirect } from "@sveltejs/kit";
import { verifyPassword } from "$lib/auth";
import { auth, setSessionTokenCookie } from "$lib/server/auth";
import type { Actions } from "./$types";
import { dbGetUserByEmail } from "$lib/db-services";

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

    try {
      const user = await dbGetUserByEmail(email);
      if (!user) return fail(400, { message: "Invalid email or password" });

      if (!user.password)
        return fail(400, {
          // TODO: specific message depending on the provider, because this is not precise enough for an average user
          message:
            "This account uses OAuth login. Please sign in with your OAuth provider.",
        });

      if (!(await verifyPassword(user.password, password))) {
        return fail(400, { message: "Invalid email or password" });
      }

      const { token, expiresAt } = await auth.createSession(user.id);

      setSessionTokenCookie(
        { cookies } as RequestEvent<Record<string, never>, null>,
        token,
        expiresAt,
      );
    } catch (err) {
      return fail(500, { message: "Internal database error." });
    }

    throw redirect(302, "/");
  },
} satisfies Actions;
