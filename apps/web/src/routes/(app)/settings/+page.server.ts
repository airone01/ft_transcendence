import { fail, redirect } from "@sveltejs/kit";
import sharp from "sharp";
import { zod } from "sveltekit-superforms/adapters";
import { message, superValidate, withFiles } from "sveltekit-superforms/server";
import { m } from "$lib/paraglide/messages";
import {
  accountSettingsSchema,
  profileFormSchema,
} from "$lib/schemas/settings";
import { hashPassword, verifyPassword } from "$lib/server/auth";
import {
  dbGetConnectedProviders,
  dbGetUser,
  dbUnlinkOAuthAccount,
  dbUpdateUser,
  type OAuthProvider,
} from "$lib/server/db-services";
import type { Actions, PageServerLoad } from "./$types";

export const load: PageServerLoad = async ({ locals }) => {
  if (!locals.user) throw redirect(302, "/");

  const user = await dbGetUser(locals.user.id);
  const hasPassword = user.password != null;

  const connectedProviders = await dbGetConnectedProviders(locals.user.id);

  return {
    profileForm: await superValidate(zod(profileFormSchema)),
    accountForm: await superValidate(zod(accountSettingsSchema)),
    //
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
          return message(
            form,
            m.settings_page_account_action_updatepassword_password_required(),
            {
              status: 400,
            },
          );
        }
        const valid = await verifyPassword(
          user.password,
          form.data.oldPassword,
        );
        if (!valid) {
          return message(
            form,
            m.settings_page_account_action_updatepassword_password_invalid(),
            {
              status: 400,
            },
          );
        }
      }

      const newHash = await hashPassword(form.data.newPassword);

      await dbUpdateUser(locals.user.id, { password: newHash });

      return message(
        form,
        m.settings_page_account_action_updatepassword_success(),
      );
    } catch (e) {
      console.error(e);
      return message(
        form,
        m.settings_page_account_action_updatepassword_fail(),
        {
          status: 500,
        },
      );
    }
  },

  unlink: async ({ request, locals }) => {
    if (!locals.user) return fail(401);

    const formData = await request.formData();
    const provider = formData.get("provider") as OAuthProvider;

    if (!provider)
      return fail(400, {
        message: m.settings_page_account_action_unlink_no_provider(),
      });

    try {
      const user = await dbGetUser(locals.user.id);
      const hasPassword = user.password != null;
      const providers = await dbGetConnectedProviders(locals.user.id);

      // don't allow unlinking if it's the only method of login for safety
      // (user has no password and only 1 connected provider)
      if (!hasPassword && providers.length <= 1) {
        return fail(400, {
          message: m.settings_page_account_action_unlink_password_required(),
        });
      }

      await dbUnlinkOAuthAccount(locals.user.id, provider);
      return { success: true };
    } catch (e) {
      console.error(e);
      return fail(500, {
        message: m.settings_page_account_action_unlink_fail(),
      });
    }
  },

  profile: async ({ request, locals }) => {
    if (!locals.user) return fail(401);

    const form = await superValidate(request, zod(profileFormSchema));
    if (!form.valid) {
      return fail(400, { form });
    }

    try {
      const updateData: { username?: string; avatar?: string; bio?: string } =
        {};

      if (form.data.username !== locals.user.username)
        updateData.username = form.data.username;

      if (form.data.bio !== locals.user.bio) updateData.bio = form.data.bio;

      if (form.data.avatar instanceof File && form.data.avatar.size > 0) {
        const buffer = await form.data.avatar.arrayBuffer();
        const processedImageBuffer = await sharp(buffer)
          .resize(256, 256, { fit: "cover" })
          .webp({ quality: 80 })
          .toBuffer();
        const base64 = `data:image/webp;base64,${processedImageBuffer.toString("base64")}`;
        updateData.avatar = base64;
      }

      if (Object.keys(updateData).length > 0) {
        await dbUpdateUser(locals.user.id, updateData);
        // manually update locals so ui reflects changes immediately
        if (updateData.username) locals.user.username = updateData.username;
        if (updateData.avatar) locals.user.avatar = updateData.avatar;
        if (updateData.bio) locals.user.bio = updateData.bio;
      }
    } catch (_error) {
      return fail(500, {
        form,
        message: m.settings_page_profile_action_default_fail(),
      });
    }

    return withFiles({ form });
  },
};
