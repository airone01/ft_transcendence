import { fail, type RequestEvent, redirect } from "@sveltejs/kit";
import { hashPassword } from "$lib/server/auth";
import {
  DBCreateUserEmailAlreadyExistsError,
  DBCreateUserUsernameAlreadyExistsError,
  dbCreateUser,
  dbIsEmailTaken,
} from "$lib/db-services";
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
    const username = data.get("username") as string;
    const unsecuredPassword = data.get("password") as string; // long name so as not to export it by accident

    if (!email || !unsecuredPassword)
      return fail(400, { message: "Missing fields." }); // i18n

    if (await dbIsEmailTaken(email))
      return fail(400, { message: "Email already registered." }); // i18n

    const passwordHash = await hashPassword(unsecuredPassword);

    try {
      const userId = await dbCreateUser({
        email,
        password: passwordHash,
        username,
      });

      const { token, expiresAt } = await auth.createSession(userId);

      setSessionTokenCookie(
        { cookies } as RequestEvent<Record<string, never>, null>,
        token,
        expiresAt,
      );
    } catch (e) {
      if (e instanceof DBCreateUserUsernameAlreadyExistsError)
        return fail(400, { message: "Username already taken." }); // i18n
      if (e instanceof DBCreateUserEmailAlreadyExistsError)
        return fail(400, { message: "Email already registered." }); // i18n
      console.error(e);
      return fail(500, { message: "Unknown database error." }); // i18n
    }

    throw redirect(302, "/");
  },
} satisfies Actions;
