<script lang="ts">
import { CircleCheck, Plug, Unplug } from "@lucide/svelte";
import type { SubmitFunction } from "@sveltejs/kit";
import { Button } from "@transc/ui/button";
import {
  FormControl,
  FormField,
  FormFieldErrors,
  FormLabel,
} from "@transc/ui/form";
import { Input } from "@transc/ui/input";
import { toast } from "svelte-sonner";
import { superForm } from "sveltekit-superforms";
import { zodClient } from "sveltekit-superforms/adapters";
import { enhance } from "$app/forms";
import SettingsHeader from "$lib/components/settings-header.svelte";
import * as m from "$lib/paraglide/messages";
import { accountSettingsSchema } from "$lib/schemas/settings";

const { data } = $props();

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
  },
});

const { form: formData, enhance: formEnhance, delayed } = form;

const unlinkEnhance: SubmitFunction = () => {
  return async ({ result, update }) => {
    if (result.type === "failure") {
      toast.error(result.data?.message || "Error unlinking account");
    } else if (result.type === "success") {
      toast.success("Account disconnected");
    }
    await update();
  };
};
</script>

<SettingsHeader
  title={m.settings_page_account_title()}
  description={m.settings_page_account_description()}
  formId="pwd-form"
  {delayed}
>
  <div class="space-y-4 mb-2">
    <div class="flex items-center justify-between">
      <div>
        <h4 class="text-sm font-medium">
          {m.settings_page_account_header_accounts()}
        </h4>
        <p class="text-xs text-muted-foreground">
          {m.settings_page_account_header_accounts_desc()}
        </p>
      </div>
    </div>

    <div class="border rounded-lg p-4 flex items-center justify-between">
      <div class="flex items-center gap-3">
        <div class="bg-[#5865F2] p-2 rounded-md text-white">
          <Plug class="h-5 w-5" />
        </div>
        <div class="flex flex-col">
          <span class="font-medium">Discord</span>
          {#if data.connectedProviders.includes("discord")}
            <span class="text-xs text-green-600 flex items-center gap-1">
              <CircleCheck class="h-3 w-3" />
              {m.settings_page_account_connected()}
            </span>
          {:else}
            <span class="text-xs text-muted-foreground"
              >{m.settings_page_account_not_connected()}</span
            >
          {/if}
        </div>
      </div>

      {#if data.connectedProviders.includes("discord")}
        <form action="?/unlink" method="POST" use:enhance={unlinkEnhance}>
          <input type="hidden" name="provider" value="discord">
          <Button
            variant="destructive"
            size="sm"
            type="submit"
            class="cursor-pointer"
          >
            <Unplug class="mr-2 h-4 w-4" />
            {m.settings_page_account_button_disconnect()}
          </Button>
        </form>
      {:else}
        <Button variant="outline" size="sm" href="/login/discord">
          {m.settings_page_account_button_connect()}
        </Button>
      {/if}
    </div>
  </div>

  <div class="space-y-4">
    <div>
      <h4 class="text-sm font-medium">
        {m.settings_page_account_label_password()}
      </h4>
      <p class="text-xs text-muted-foreground">
        {data.hasPassword
          ? {
              current: m.settings_page_account_label_password_desc(),
            }
          : m.settings_page_account_label_no_password_desc()}
      </p>
    </div>

    <form
      method="POST"
      action="?/updatePassword"
      id="pwd-form"
      use:formEnhance
      class="space-y-4 max-w-md"
    >
      {#if data.hasPassword}
        <FormField {form} name="oldPassword">
          <FormControl>
            {#snippet children({ props })}
              <FormLabel>
                {m.settings_page_account_label_current_password()}
              </FormLabel>
              <Input
                {...props}
                type="password"
                bind:value={$formData.oldPassword}
              />
            {/snippet}
          </FormControl>
          <FormFieldErrors />
        </FormField>
      {/if}

      <FormField {form} name="newPassword">
        <FormControl>
          {#snippet children({ props })}
            <FormLabel>
              {m.settings_page_account_label_new_password()}
            </FormLabel>
            <Input
              {...props}
              type="password"
              bind:value={$formData.newPassword}
            />
          {/snippet}
        </FormControl>
        <FormFieldErrors />
      </FormField>

      <FormField {form} name="confirmPassword">
        <FormControl>
          {#snippet children({ props })}
            <FormLabel>
              {m.settings_page_account_label_confirm_password()}
            </FormLabel>
            <Input
              {...props}
              type="password"
              bind:value={$formData.confirmPassword}
            />
          {/snippet}
        </FormControl>
        <FormFieldErrors />
      </FormField>
    </form>
  </div>
</SettingsHeader>
