<script lang="ts">
import { superForm, type FormPath } from "sveltekit-superforms";
import { zodClient } from "sveltekit-superforms/adapters";
import SettingsHeader from "$lib/components/settings-header.svelte";
import { gameplayFormSchema } from "$lib/schemas/settings.js";
import { toast } from "svelte-sonner";
import { FormField, FormLabel, FormControl, FormFieldErrors } from "@transc/ui/form";
import { Checkbox } from "@transc/ui/checkbox";
import z from "zod/v3";

let { data } = $props();

const form = superForm(data.form, {
  validators: zodClient(gameplayFormSchema),
  invalidateAll: true, // reloads data.user after update
  onUpdated: ({ form }) => {
    if (form.valid) {
      toast.success("Profile updated successfully");
    }
  }
});

const { form: formData, enhance, delayed } = form;

// i18n
const fields: [FormPath<z.infer<typeof gameplayFormSchema>>, string, string?][] = [
  ["enablePremoves", "Enable Premoves", "Make legal moves during your opponent's turn to be played automatically on your turn."],
  ["alwaysPromoteToQueen", "Always Promote Pawns to Queen", "Disable auto-queen by holding the ALT key when promoting."],
  ["showLegalMoves", "Display Legal Chess Moves", "Disable auto-queen by holding the ALT key when promoting."],
  ["confirmResignOrDraw", "Confirm Resign/Draw?", "When you resign a game or send a draw offer, you will be asked to confirm."],
  ["showLegalMoves", "Show Legal Moves"],
  ["lowTimeWarning", "Low-Time Warning", "Visual and audible warnings when you're low on time."],
  ["focusModeAlwaysOn", "Always Use Focus Mode"],
  ["whiteAlwaysBottom", "White Always on Bottom"]
];
</script>

<SettingsHeader title="Gameplay" description="In-game settings." formId="gameplaySettingsForm" {delayed}>
  <form 
    id="gameplaySettingsForm"
    method="POST"
    action="/settings/gameplay"
    use:enhance
    class="flex-1 flex flex-col gap-4 items-start"
  >
    {#each fields as [name, label, description]}
      <FormField {form} {name}>
        <FormControl>
          {#snippet children({ props })}
            <FormLabel class="hover:bg-accent/5 flex items-start gap-3 rounded-lg border p-3 has-aria-checked:border-accent/50 has-aria-checked:bg-accent/20 transition-all mb-0 max-w-md">
              <Checkbox
                {...props}
                class="data-[state=checked]:border-accent data-[state=checked]:bg-accent data-[state=checked]:text-primary-foreground rounded-sm"
                bind:checked={$formData[name]}
              />
              <div class="grid gap-1.5 font-normal">
                <p class="text-sm leading-none font-normal">{label}</p>
                {#if description != null}
                  <p class="text-muted-foreground text-sm">{description}</p>
                {/if}
              </div>
            </FormLabel>
          {/snippet}
        </FormControl>
        <FormFieldErrors />
      </FormField>
    {/each}
  </form>
</SettingsHeader>
