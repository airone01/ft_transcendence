import { fail, type RequestEvent, redirect } from "@sveltejs/kit";
import { message, superValidate } from "sveltekit-superforms";
import { zod } from "sveltekit-superforms/adapters";
import { registerSchema } from "$lib/schemas/auth";
import { auth, hashPassword, setSessionTokenCookie } from "$lib/server/auth";
import {
  DBCreateUserEmailAlreadyExistsError,
  DBCreateUserUsernameAlreadyExistsError,
  dbCreateUser,
  dbIsEmailTaken,
} from "$lib/server/db-services";
import type { Actions } from "./$types";
import * as m from "$lib/paraglide/messages";

export const actions = {
  default: async ({ request, cookies }) => {
    const form = await superValidate(request, zod(registerSchema));

    if (!form.valid) {
      return fail(400, { form });
    }

    if (await dbIsEmailTaken(form.data.email))
      return message(form, m.register_email_taken(), {
        status: 400,
      });

    try {
      const passwordHash = await hashPassword(form.data.password);

      const userId = await dbCreateUser({
        email: form.data.email,
        password: passwordHash,
        username: form.data.username,
      });

      const { token, expiresAt } = await auth.createSession(userId);
      setSessionTokenCookie(
        { cookies } as RequestEvent<Record<string, never>, null>,
        token,
        expiresAt,
      );
    } catch (e) {
      if (e instanceof DBCreateUserUsernameAlreadyExistsError)
        return fail(400, {
          form: {
            ...form,
            errors: {
              ...form.errors,
              username: [m.register_username_taken()],
            },
          },
        });
      if (e instanceof DBCreateUserEmailAlreadyExistsError)
        return fail(400, {
          form: {
            ...form,
            errors: {
              ...form.errors,
              email: [m.register_email_taken()],
            },
          },
        });
      console.error(e);
      return message(form, m.unkown_db_error(), {
        status: 500,
      });
    }

    throw redirect(302, "/");
  },
} satisfies Actions;
