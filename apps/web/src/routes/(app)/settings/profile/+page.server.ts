import { fail, redirect } from "@sveltejs/kit";
import sharp from "sharp";
import { superValidate, withFiles } from "sveltekit-superforms";
import { zod } from "sveltekit-superforms/adapters";
import { profileFormSchema } from "$lib/schemas/settings";
import { dbUpdateUser } from "$lib/server/db-services";
import type { Actions, PageServerLoad } from "./$types";

export const load: PageServerLoad = async ({ locals }) => {
  if (!locals.user) throw redirect(302, "/");

  const form = await superValidate(
    { username: locals.user.username },
    zod(profileFormSchema),
  );

  return { form };
};

export const actions: Actions = {
  default: async ({ request, locals }) => {
    if (!locals.user) return fail(401);

    const form = await superValidate(request, zod(profileFormSchema));
    if (!form.valid) {
      return fail(400, { form });
    }

    try {
      const updateData: { username?: string; avatar?: string } = {};

      if (form.data.username !== locals.user.username)
        updateData.username = form.data.username;

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
      }
    } catch (_error) {
      return fail(500, {
        form,
        message: "Could not update profile." /* i18n */,
      });
    }

    return withFiles({ form });
  },
};
