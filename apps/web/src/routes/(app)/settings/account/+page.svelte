<script lang="ts">
import { enhance } from "$app/forms";
import SettingsHeader from "$lib/components/settings-header.svelte";
import { Button } from "@transc/ui/button";
import { Input } from "@transc/ui/input";
import { Separator } from "@transc/ui/separator";
import { Badge } from "@transc/ui/badge";
import { FormField, FormControl, FormLabel, FormFieldErrors } from "@transc/ui/form";
import { superForm } from "sveltekit-superforms";
import { zodClient } from "sveltekit-superforms/adapters";
import { accountSettingsSchema } from "$lib/schemas/settings";
import { toast } from "svelte-sonner";
import { Unplug, Plug, CircleCheck } from "@lucide/svelte";

let { data } = $props();

// svelte-ignore state_referenced_locally: superForms does not accept functions such as `() => data`
const form = superForm(data.form, {
  validators: zodClient(accountSettingsSchema),
  invalidateAll: true,
  resetForm: true,
  onUpdated: ({ form }) => {
  if (form.valid) {
    toast.success("Security settings updated");
  } else if (form.message) {
    toast.error(form.message);
  }
  }
});

const { form: formData, enhance: formEnhance, delayed } = form;

const unlinkEnhance = () => {
  return async ({ result, update }: any) => {
    if (result.type === 'failure') {
      toast.error(result.data?.message || "Error unlinking account");
    } else if (result.type === 'success') {
      toast.success("Account disconnected");
    }
    await update();
  };
};
</script>

<SettingsHeader title="Account" description="Manage your credentials and connected services." formId="pwd-form" {delayed}>
  
  <div class="space-y-4 mb-6">
    <div class="flex items-center justify-between">
      <div>
        <h3 class="text-base font-medium">Connected Accounts</h3>
        <p class="text-sm text-muted-foreground">Log in faster with these services.</p>
      </div>
    </div>
    
    <div class="border rounded-lg p-4 flex items-center justify-between">
      <div class="flex items-center gap-3">
        <div class="bg-[#5865F2] p-2 rounded-md text-white">
          <Plug class="h-5 w-5" />
        </div>
        <div class="flex flex-col">
          <span class="font-medium">Discord</span>
          {#if data.connectedProviders.includes('discord')}
            <span class="text-xs text-green-600 flex items-center gap-1">
              <CircleCheck class="h-3 w-3" /> Connected
            </span>
          {:else}
            <span class="text-xs text-muted-foreground">Not connected</span>
          {/if}
        </div>
      </div>

      {#if data.connectedProviders.includes('discord')}
        <form action="?/unlink" method="POST" use:enhance={unlinkEnhance}>
          <input type="hidden" name="provider" value="discord" />
          <Button variant="outline" size="sm" type="submit" class="text-destructive hover:text-destructive">
            <Unplug class="mr-2 h-4 w-4" /> Disconnect
          </Button>
        </form>
      {:else}
        <Button variant="outline" size="sm" href="/login/discord">
          Connect
        </Button>
      {/if}
    </div>
  </div>

  <Separator class="my-6" />

  <div class="space-y-4">
    <div>
      <h3 class="text-base font-medium">Password</h3>
      <p class="text-sm text-muted-foreground">
        {data.hasPassword 
          ? "Change your password to keep your account secure." 
          : "You haven't set a password yet. Set one to log in with email/password."}
      </p>
    </div>

    <form method="POST" action="?/updatePassword" id="pwd-form" use:formEnhance class="space-y-4 max-w-md">
      {#if data.hasPassword}
        <FormField {form} name="oldPassword">
          <FormControl>
            {#snippet children({ props })}
              <FormLabel>Current Password</FormLabel>
              <Input {...props} type="password" bind:value={$formData.oldPassword} />
            {/snippet}
          </FormControl>
          <FormFieldErrors />
        </FormField>
      {/if}

      <FormField {form} name="newPassword">
        <FormControl>
          {#snippet children({ props })}
            <FormLabel>New Password</FormLabel>
            <Input {...props} type="password" bind:value={$formData.newPassword} />
          {/snippet}
        </FormControl>
        <FormFieldErrors />
      </FormField>

      <FormField {form} name="confirmPassword">
        <FormControl>
          {#snippet children({ props })}
            <FormLabel>Confirm Password</FormLabel>
            <Input {...props} type="password" bind:value={$formData.confirmPassword} />
          {/snippet}
        </FormControl>
        <FormFieldErrors />
      </FormField>
    </form>
  </div>
</SettingsHeader>
