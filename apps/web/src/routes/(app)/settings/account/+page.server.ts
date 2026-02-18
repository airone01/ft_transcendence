import { fail, redirect } from "@sveltejs/kit";
import { message, superValidate } from "sveltekit-superforms";
import { zod } from "sveltekit-superforms/adapters";
import {
  dbGetConnectedProviders,
  dbGetUser, // We need this to fetch the real password hash
  dbUnlinkOAuthAccount,
  dbUpdateUser,
} from "$lib/db-services";
import { accountSettingsSchema } from "$lib/schemas/settings";
import { hashPassword, verifyPassword } from "$lib/server/auth";
import type { Actions, PageServerLoad } from "./$types";

export const load: PageServerLoad = async ({ locals }) => {
  if (!locals.user) throw redirect(302, "/");

  const user = await dbGetUser(locals.user.id);
  const hasPassword = user.password != null;

  const connectedProviders = await dbGetConnectedProviders(locals.user.id);
  const form = await superValidate(zod(accountSettingsSchema));

  return {
    form,
    connectedProviders,
    hasPassword,
  };
};

export const actions: Actions = {
  updatePassword: async ({ request, locals }) => {
    if (!locals.user) return fail(401);

    const form = await superValidate(request, zod(accountSettingsSchema));
    if (!form.valid) return fail(400, { form });

    try {
      const user = await dbGetUser(locals.user.id);

      if (user.password) {
        if (!form.data.oldPassword) {
          return message(form, "Current password is required" /* i18n */, {
            status: 400,
          });
        }
        const valid = await verifyPassword(
          user.password,
          form.data.oldPassword,
        );
        if (!valid) {
          return message(form, "Incorrect current password" /* i18n */, {
            status: 400,
          });
        }
      }

      const newHash = await hashPassword(form.data.newPassword);

      await dbUpdateUser(locals.user.id, { password: newHash });

      return message(form, "Password updated successfully" /* i18n */);
    } catch (e) {
      console.error(e);
      return message(form, "Failed to update password" /* i18n */, {
        status: 500,
      });
    }
  },

  unlink: async ({ request, locals }) => {
    if (!locals.user) return fail(401);

    const formData = await request.formData();
    const provider = formData.get("provider") as string;

    if (!provider)
      return fail(400, { message: "Provider required" /* i18n */ });

    try {
      const user = await dbGetUser(locals.user.id);
      const hasPassword = user.password != null;
      const providers = await dbGetConnectedProviders(locals.user.id);

      // don't allow unlinking if it's the only method of login for safety
      // (user has no password and only 1 connected provider)
      if (!hasPassword && providers.length <= 1) {
        return fail(400, {
          message:
            "You must set a password before disconnecting your last login method." /* i18n */,
        });
      }

      await dbUnlinkOAuthAccount(locals.user.id, provider as unknown);
      return { success: true };
    } catch (e) {
      console.error(e);
      return fail(500, { message: "Could not unlink account" /* i18n */ });
    }
  },
};
