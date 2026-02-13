import { privacyFormSchema } from "$lib/schemas/settings";
import { makeSettingsAction } from "$lib/server/form-factory";

const { load, actions } = makeSettingsAction(privacyFormSchema, async () => {
  return {
    allowFriendRequests: true,
    gameHistory: true,
    privateMode: false,
  };
});

export { load, actions };
