import { fail, type RequestEvent, redirect } from "@sveltejs/kit";
import { dbGetUserByEmail } from "$lib/db-services";
import { auth, setSessionTokenCookie, verifyPassword } from "$lib/server/auth";
import type { Actions } from "./$types";

/* Dev note: The login and register pages could be made much more safe by
 * leveraging formsnap, superforms and zod together, as explained in the Svelte
 * shadcn page for formsnap https://www.shadcn-svelte.com/docs/components/form.
 * This might be worth invisegating. */

/**
 * @brief Cryptic and general error message, to avoid malicious actors
 * having access to more info than wanted (enumerating db emails, etc.).
 *
 * The thought process is that we don't want to tell users why exactly they
 * could not connect, otherwise that information could be extracted to find
 * out which emails are in DB, brute-force passwords, or to know when someone
 * uses OAuth or not.
 */
const crypticFail = () =>
  fail(400, {
    message: "Invalid email or password, or the associated account uses OAuth.",
  });

export const actions = {
  default: async ({ request, cookies }) => {
    // NOTE: a forged request WILL crash the app here if those are not strings
    // need type verification with zod
    const data = await request.formData();
    const email = data.get("email") as string;
    const password = data.get("password") as string;

    try {
      const user = await dbGetUserByEmail(email);

      // explaination in `crypticFail` JSDoc above

      if (!user)
        // invalid user
        return crypticFail();

      if (!user.password)
        // this is an oauth account
        return crypticFail();

      if (!(await verifyPassword(user.password, password)))
        // invalid password for email
        return crypticFail();

      const { token, expiresAt } = await auth.createSession(user.id);

      setSessionTokenCookie(
        { cookies } as RequestEvent<Record<string, never>, null>,
        token,
        expiresAt,
      );
    } catch (_err) {
      return fail(500, { message: "Internal database error." });
    }

    throw redirect(302, "/");
  },
} satisfies Actions;
