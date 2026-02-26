<script lang="ts">
import { toast } from "svelte-sonner";
import { superForm } from "sveltekit-superforms";
import { zodClient } from "sveltekit-superforms/adapters";
import SettingsFormCheckboxes from "$lib/components/settings-form-checkboxes.svelte";
import SettingsHeader from "$lib/components/settings-header.svelte";
import { gameplayFormSchema } from "$lib/schemas/settings";

const { data } = $props();

// svelte-ignore state_referenced_locally: superForms does not accept functions such as `() => data`
const form = superForm(data.form, {
  validators: zodClient(gameplayFormSchema),
  invalidateAll: true, // reloads data after update
  onUpdated: ({ form }) => {
    if (form.valid) {
      toast.success("Profile updated successfully");
    }
  },
});
</script>

<SettingsHeader
  title="Gameplay"
  description="In-game settings."
  formId="gameplaySettingsForm"
  delayed={form.delayed}
>
  <SettingsFormCheckboxes
    formId="gameplaySettingsForm"
    form={form}
    schema={gameplayFormSchema}
    action="/settings/gameplay"
    fields={[
      ["enablePremoves", "Enable Premoves", "Make legal moves during your opponent's turn to be played automatically on your turn."],
      ["alwaysPromoteToQueen", "Always Promote Pawns to Queen", "Disable auto-queen by holding the ALT key when promoting."],
      ["showLegalMoves", "Display Legal Chess Moves", "Disable auto-queen by holding the ALT key when promoting."],
      ["confirmResignOrDraw", "Confirm Resign/Draw?", "When you resign a game or send a draw offer, you will be asked to confirm."],
      ["showLegalMoves", "Show Legal Moves"],
      ["lowTimeWarning", "Low-Time Warning", "Visual and audible warnings when you're low on time."],
      ["focusModeAlwaysOn", "Always Use Focus Mode"],
      ["whiteAlwaysBottom", "White Always on Bottom"]
    ]}
  />
</SettingsHeader>
