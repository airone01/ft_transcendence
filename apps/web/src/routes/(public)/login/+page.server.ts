import { fail, type RequestEvent, redirect } from "@sveltejs/kit";
import { message, superValidate } from "sveltekit-superforms";
import { zod } from "sveltekit-superforms/adapters";
import { loginSchema } from "$lib/schemas/auth";
import { auth, setSessionTokenCookie, verifyPassword } from "$lib/server/auth";
import { dbGetUserByEmail } from "$lib/server/db-services";
import type { Actions } from "./$types";

export const actions = {
  default: async ({ request, cookies }) => {
    const form = await superValidate(request, zod(loginSchema));

    if (!form.valid) return fail(400, { form });

    try {
      const user = await dbGetUserByEmail(form.data.email);

      /**
       * @brief Cryptic and general error message, to avoid malicious actors
       * having access to more info than wanted (enumerating db emails, etc.).
       *
       * The thought process is that we don't want to tell users why exactly they
       * could not connect, otherwise that information could be extracted to find
       * out which emails are in DB, brute-force passwords, or to know when someone
       * uses OAuth or not.
       *
       * Conditions below are, in order (OR):
       * - there is no user account with that email
       * - there is an account, but no password, meaning it's an oauth account
       * - there is an account, but the password doesn't match
       */
      if (
        !user ||
        !user.password ||
        !(await verifyPassword(user.password, form.data.password))
      )
        return message(
          form,
          "Invalid email or password, or an associated account uses OAuth." /* i18n */,
          { status: 400 },
        );

      const { token, expiresAt } = await auth.createSession(user.id);

      setSessionTokenCookie(
        { cookies } as RequestEvent<Record<string, never>, null>,
        token,
        expiresAt,
      );
    } catch (_err) {
      return message(form, "Internal server error" /* i18n */, { status: 500 });
    }

    throw redirect(302, "/");
  },
} satisfies Actions;
