import { fail, type RequestEvent, redirect } from "@sveltejs/kit";
import { message, superValidate } from "sveltekit-superforms";
import { zod } from "sveltekit-superforms/adapters";
import * as m from "$lib/paraglide/messages";
import { registerSchema } from "$lib/schemas/auth";
import { auth, hashPassword, setSessionTokenCookie } from "$lib/server/auth";
import { generateDefaultAvatar } from "$lib/server/avatar";
import {
  DBCreateUserEmailAlreadyExistsError,
  DBCreateUserUsernameAlreadyExistsError,
  dbCreateUser,
  dbIsEmailTaken,
} from "$lib/server/db-services";
import { checkHttpRateLimit } from "$lib/server/http-rate-limiter";
import type { Actions } from "./$types";

export const actions = {
  default: async ({ request, cookies, getClientAddress }) => {
    if (!checkHttpRateLimit(getClientAddress(), 10, "register"))
      return message(
        await superValidate(request, zod(registerSchema)),
        m.internal_server_error(),
        { status: 429 },
      );

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
      const defaultAvatar = generateDefaultAvatar(form.data.username);

      const userId = await dbCreateUser({
        email: form.data.email,
        password: passwordHash,
        username: form.data.username,
        avatar: defaultAvatar,
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
