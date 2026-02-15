import { fail, type RequestEvent, redirect } from "@sveltejs/kit";
import { message, superValidate } from "sveltekit-superforms";
import { zod } from "sveltekit-superforms/adapters";
import {
  DBCreateUserEmailAlreadyExistsError,
  DBCreateUserUsernameAlreadyExistsError,
  dbCreateUser,
  dbIsEmailTaken,
} from "$lib/db-services";
import { registerSchema } from "$lib/schemas/auth";
import { auth, hashPassword, setSessionTokenCookie } from "$lib/server/auth";
import type { Actions } from "./$types";

export const actions = {
  default: async ({ request, cookies }) => {
    const form = await superValidate(request, zod(registerSchema));

    if (!form.valid) {
      return fail(400, { form });
    }

    if (await dbIsEmailTaken(form.data.email))
      return message(form, "Email already registered." /* i18n */, {
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
              username: ["Username already taken." /* i18n */],
            },
          },
        });
      if (e instanceof DBCreateUserEmailAlreadyExistsError)
        return fail(400, {
          form: {
            ...form,
            errors: {
              ...form.errors,
              email: ["Email already registered." /* i18n */],
            },
          },
        });
      console.error(e);
      return message(form, "Unknown database error." /* i18n */, {
        status: 500,
      });
    }

    throw redirect(302, "/");
  },
} satisfies Actions;
