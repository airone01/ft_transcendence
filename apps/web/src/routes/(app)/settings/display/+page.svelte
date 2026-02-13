<script lang="ts">
import SettingsFormCheckboxes from "$lib/components/settings-form-checkboxes.svelte";
import SettingsHeader from "$lib/components/settings-header.svelte";
import { superForm } from "sveltekit-superforms";
import { displayFormSchema } from "$lib/schemas/settings";
import { zodClient } from "sveltekit-superforms/adapters";
import { toast } from "svelte-sonner";

let { data } = $props();

const form = superForm(data.form, {
  validators: zodClient(displayFormSchema),
  invalidateAll: true, // reloads data after update
  onUpdated: ({ form }) => {
    if (form.valid) {
      toast.success("Profile updated successfully");
    }
  }
});
</script>

<SettingsHeader title="Display" description="Visual settings." formId="displaySettingsForm" delayed={form.delayed}>
  <SettingsFormCheckboxes 
    formId="displaySettingsForm"
    form={form}
    schema={displayFormSchema}
    action="/settings/display"
    fields = {[
      ["darkMode", "Enable Dark Mode", "A little rest for your tired eyes"],
      ["showPlayerRatingInGame", "Display Players Rank while in-Game"],
    ]}
  />
</SettingsHeader>
