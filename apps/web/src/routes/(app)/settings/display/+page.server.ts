import { displayFormSchema } from "$lib/schemas/settings";
import { makeSettingsAction } from "$lib/server/form-factory";

const { load, actions } = makeSettingsAction(displayFormSchema, async () => {
  return {
    darkMode: false,
    showPlayerRatingInGame: true,
  };
});

export { load, actions };
