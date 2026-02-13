<script lang="ts">
import SettingsFormCheckboxes from "$lib/components/settings-form-checkboxes.svelte";
import SettingsHeader from "$lib/components/settings-header.svelte";
import { superForm, type FormPath } from "sveltekit-superforms";
import { soundsFormSchema } from "$lib/schemas/settings";
import { zodClient } from "sveltekit-superforms/adapters";
import { toast } from "svelte-sonner";

let { data } = $props();

const form = superForm(data.form, {
  validators: zodClient(soundsFormSchema),
  invalidateAll: true, // reloads data after update
  onUpdated: ({ form }) => {
    if (form.valid) {
      toast.success("Profile updated successfully");
    }
  }
});
</script>

<SettingsHeader title="Sound" description="Hearing capilities settings." formId="soundSettingsForm" delayed={form.delayed}>
  <SettingsFormCheckboxes 
    formId="soundSettingsForm"
    form={form}
    schema={soundsFormSchema}
    action="/settings/sound"
    fields = {[
      ["playSounds", "Enable Sounds", "Enables some sounds and music that react to the board, to make your experience more immersive."],
    ]}
  />
</SettingsHeader>
