import { gameplayFormSchema } from "$lib/schemas/settings";
import { makeSettingsAction } from "$lib/server/form-factory";

const { load, actions } = makeSettingsAction(gameplayFormSchema, async () => {
  return {
    enablePremoves: true,
    alwaysPromoteToQueen: true,
    confirmResignOrDraw: true,
    focusModeAlwaysOn: false,
    lowTimeWarning: true,
    showLegalMoves: true,
    writeBottomAlwaysOn: false,
  };
});

export { load, actions };
