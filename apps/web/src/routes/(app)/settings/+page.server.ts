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
import { checkHttpRateLimit } from "$lib/server/http-rate-limiter";
import type { Actions, PageServerLoad } from "./$types";

export const load: PageServerLoad = async ({ locals }) => {
  if (!locals.user) throw redirect(302, "/");

  const user = await dbGetUser(locals.user.id);
  const hasPassword = user.password != null;

  const connectedProviders = await dbGetConnectedProviders(locals.user.id);

  return {
    profileForm: await superValidate(zod(profileFormSchema)),
    accountForm: await superValidate(zod(accountSettingsSchema)),
    connectedProviders,
    hasPassword,
  };
};

export const actions: Actions = {
  updatePassword: async ({ request, locals, getClientAddress }) => {
    if (!locals.user) return fail(401);
    if (!checkHttpRateLimit(getClientAddress(), 60)) return fail(429, { message: "Too many requests" });

    const form = await superValidate(request, zod(accountSettingsSchema));
    if (!form.valid) return fail(400, { form });

    try {
      const user = await dbGetUser(locals.user.id);

      if (user.password) {
        if (!form.data.oldPassword) {
          return message(form, m.settings_page_account_action_updatepassword_password_required(), { status: 400 });
        }
        const valid = await verifyPassword(user.password, form.data.oldPassword);
        if (!valid) {
          return message(form, m.settings_page_account_action_updatepassword_password_invalid(), { status: 400 });
        }
      }

      const newHash = await hashPassword(form.data.newPassword);
      await dbUpdateUser(locals.user.id, { password: newHash });

      return message(form, m.settings_page_account_action_updatepassword_success());
    } catch (e) {
      console.error(e);
      return message(form, m.settings_page_account_action_updatepassword_fail(), { status: 500 });
    }
  },

  unlink: async ({ request, locals, getClientAddress }) => {
    if (!locals.user) return fail(401);
    if (!checkHttpRateLimit(getClientAddress(), 60)) return fail(429, { message: "Too many requests" });

    const formData = await request.formData();
    const provider = formData.get("provider") as OAuthProvider;

    if (!provider)
      return fail(400, { message: m.settings_page_account_action_unlink_no_provider() });

    try {
      const user = await dbGetUser(locals.user.id);
      const hasPassword = user.password != null;
      const providers = await dbGetConnectedProviders(locals.user.id);

      if (!hasPassword && providers.length <= 1) {
        return fail(400, { message: m.settings_page_account_action_unlink_password_required() });
      }

      await dbUnlinkOAuthAccount(locals.user.id, provider);
      return { success: true };
    } catch (e) {
      console.error(e);
      return fail(500, { message: m.settings_page_account_action_unlink_fail() });
    }
  },

  profile: async ({ request, locals, getClientAddress }) => {
    if (!locals.user) return fail(401);
  console.log("[RateLimit] IP:", getClientAddress()); // ← ici
  if (!checkHttpRateLimit(getClientAddress(), 60)) return fail(429, { message: "Too many requests" });

    const form = await superValidate(request, zod(profileFormSchema));
    if (!form.valid) return fail(400, { form });

    try {
      const updateData: { username?: string; avatar?: string; bio?: string } = {};

      if (form.data.username !== locals.user.username)
        updateData.username = form.data.username;

      if (form.data.bio !== locals.user.bio)
        updateData.bio = form.data.bio;

      if (form.data.avatar instanceof File && form.data.avatar.size > 0) {
        const buffer = Buffer.from(await form.data.avatar.arrayBuffer());

        const b = buffer.subarray(0, 12);
        const isJpeg = b[0] === 0xff && b[1] === 0xd8 && b[2] === 0xff;
        const isPng = b[0] === 0x89 && b[1] === 0x50 && b[2] === 0x4e && b[3] === 0x47;
        const isGif = b[0] === 0x47 && b[1] === 0x49 && b[2] === 0x46;
        const isWebp =
          b[0] === 0x52 && b[1] === 0x49 && b[2] === 0x46 && b[3] === 0x46 &&
          b[8] === 0x57 && b[9] === 0x45 && b[10] === 0x42 && b[11] === 0x50;

        if (!isJpeg && !isPng && !isGif && !isWebp) {
            return fail(400, withFiles({ form, message: "Invalid image format. Only JPEG, PNG, GIF and WebP are allowed." }));
        }

        const processedImageBuffer = await sharp(buffer)
          .resize(256, 256, { fit: "cover" })
          .webp({ quality: 80 })
          .toBuffer();
        const base64 = `data:image/webp;base64,${processedImageBuffer.toString("base64")}`;
        updateData.avatar = base64;
      }

      if (Object.keys(updateData).length > 0) {
        await dbUpdateUser(locals.user.id, updateData);
        if (updateData.username) locals.user.username = updateData.username;
        if (updateData.avatar) locals.user.avatar = updateData.avatar;
        if (updateData.bio) locals.user.bio = updateData.bio;
      }
    } catch (_error) {
      return fail(500, { form, message: m.settings_page_profile_action_default_fail() });
    }

    return withFiles({ form });
  },
};