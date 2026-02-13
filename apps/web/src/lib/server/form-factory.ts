import { type Action, fail, type RequestEvent, redirect } from "@sveltejs/kit";
import { type Infer, superValidate, withFiles } from "sveltekit-superforms";
import { zod } from "sveltekit-superforms/adapters";
import type { AnyZodObject, z } from "zod/v3";

/**
 * @brief factory to generate server functions for a form validation server file
 *
 * @tparam T: type of formSchema
 *
 * @param formSchema: zod schema of the form
 * @param getInitialData: callback function that takes as arguments the user
 *        and returns Promise<Partial<z.infer<T>>> to get initial data.
 *        inside this callback, we can write DB calls, or just default data.
 * @param onUpdate: if defined, this callback promise will be called to update
 *        the database with the newly saved data. its arguments are user id and
 *        the data.
 *
 * @returns object containing functions load and actions to be exported
 *          individually by destructuration.
 */
export function makeSettingsAction<T extends AnyZodObject>(
  formSchema: T,
  getInitialData: (user: App.Locals["user"]) => Promise<Partial<z.infer<T>>>,
  onUpdate?: (userId: number, data: Infer<T>) => Promise<void>,
) {
  const load = async ({ locals }: RequestEvent) => {
    if (!locals.user) throw redirect(302, "/");

    const initialData = await getInitialData(locals.user);
    const form = await superValidate(initialData, zod(formSchema));

    return { form };
  };

  const action: Action = async ({ request, locals }) => {
    if (!locals.user) return fail(401);

    const form = await superValidate(request, zod(formSchema));
    if (!form.valid) return fail(400, { form });

    try {
      if (onUpdate != null) await onUpdate(locals.user.id, form.data);

      // no manual updates of locals so the UI reflects changes immediately
      // here, because it's too complicated to type correctly and it's only
      // every used for `locals.user` which already has its own custom functions
    } catch (error) {
      console.error(error);
      return fail(500, { form, message: "Could not update settings." });
    }

    return withFiles({ form });
  };

  return {
    load,
    actions: { default: action },
  };
}
