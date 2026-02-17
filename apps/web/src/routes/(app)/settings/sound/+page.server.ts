import { soundsFormSchema } from "$lib/schemas/settings";
import { makeSettingsAction } from "$lib/server/form-factory";

const { load, actions } = makeSettingsAction(soundsFormSchema, async () => {
  return {
    playSounds: true,
  };
});

export { load, actions };
