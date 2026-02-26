<script lang="ts">
import { toast } from "svelte-sonner";
import { superForm } from "sveltekit-superforms";
import { zodClient } from "sveltekit-superforms/adapters";
import SettingsFormCheckboxes from "$lib/components/settings-form-checkboxes.svelte";
import SettingsHeader from "$lib/components/settings-header.svelte";
import { displayFormSchema } from "$lib/schemas/settings";

const { data } = $props();

// svelte-ignore state_referenced_locally: superForms does not accept functions such as `() => data`
const form = superForm(data.form, {
  validators: zodClient(displayFormSchema),
  invalidateAll: true, // reloads data after update
  onUpdated: ({ form }) => {
    if (form.valid) {
      toast.success("Profile updated successfully");
    }
  },
});
</script>

<SettingsHeader
  title="Display"
  description="Visual settings."
  formId="displaySettingsForm"
  delayed={form.delayed}
>
  <SettingsFormCheckboxes
    formId="displaySettingsForm"
    form={form}
    schema={displayFormSchema}
    action="/settings/display"
    fields={[
      ["darkMode", "Enable Dark Mode", "A little rest for your tired eyes"],
      ["showPlayerRatingInGame", "Display Players Rank while in-Game"],
    ]}
  />
</SettingsHeader>
