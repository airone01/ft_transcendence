import { fail, redirect } from "@sveltejs/kit";
import { db } from "@transc/db";
import { users } from "@transc/db/schema";
import { eq } from "drizzle-orm";
import { superValidate } from "sveltekit-superforms";
import { zod } from "sveltekit-superforms/adapters";
import { dbUpdateUser } from "$lib/db-services";
import { profileFormSchema } from "$lib/schemas/settings";
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
  updateProfile: async ({ request, locals }) => {
    if (!locals.user) return fail(401);

    const form = await superValidate(request, zod(profileFormSchema));

    if (!form.valid || typeof form.data.username !== "string") {
      return fail(400, { form });
    }

    try {
      await dbUpdateUser(locals.user.id, {
        username: form.data.username,
      });
      await db
        .update(users)
        .set({ username: form.data.username })
        .where(eq(users.id, locals.user.id));
    } catch (_error) {
      return fail(500, { form, message: "Could not update profile." });
    }

    return { form };
  },
};
