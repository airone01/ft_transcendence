<script lang="ts">
import SettingsFormCheckboxes from "$lib/components/settings-form-checkboxes.svelte";
import SettingsHeader from "$lib/components/settings-header.svelte";
import { superForm, type FormPath } from "sveltekit-superforms";
import { privacyFormSchema } from "$lib/schemas/settings";
import { zodClient } from "sveltekit-superforms/adapters";
import { toast } from "svelte-sonner";

let { data } = $props();

const form = superForm(data.form, {
  validators: zodClient(privacyFormSchema),
  invalidateAll: true, // reloads data after update
  onUpdated: ({ form }) => {
    if (form.valid) {
      toast.success("Profile updated successfully");
    }
  }
});
</script>

<SettingsHeader title="Privacy" description="Confidentiality and data settings." formId="privacySettingsForm" delayed={form.delayed}>
  <SettingsFormCheckboxes 
    formId="privacySettingsForm"
    form={form}
    schema={privacyFormSchema}
    action="/settings/privacy"
    fields = {[
      ["allowFriendRequests", "Allow Friend Requests from other Users"],
      ["privateMode", "Private Mode", "Makes you display as offline and disables game history."],
      ["gameHistory", "Game History", "If you disable this, you won't see your previous matches."]
    ]}
  />
</SettingsHeader>
