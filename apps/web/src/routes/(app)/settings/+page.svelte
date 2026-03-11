<script lang="ts">
import {
  CameraIcon,
  CircleAlertIcon,
  CircleCheck,
  Plug,
  Unplug,
} from "@lucide/svelte";
import type { SubmitFunction } from "@sveltejs/kit";
import { Alert, AlertDescription } from "@transc/ui/alert";
import { Avatar, AvatarFallback, AvatarImage } from "@transc/ui/avatar";
import { Button } from "@transc/ui/button";
import {
  FormControl,
  FormField,
  FormFieldErrors,
  FormLabel,
} from "@transc/ui/form";
import { ImageCropper } from "@transc/ui/image-cropper";
import { Input } from "@transc/ui/input";
import { toast } from "svelte-sonner";
import { superForm } from "sveltekit-superforms";
import { zodClient } from "sveltekit-superforms/adapters";
import { enhance } from "$app/forms";
import { goto } from "$app/navigation";
import { page } from "$app/state";
import LanguageSwitcher from "$lib/components/language-switcher.svelte";
import ModeToggle from "$lib/components/mode-toggle.svelte";
import * as m from "$lib/paraglide/messages";
import {
  accountSettingsSchema,
  profileFormSchema,
} from "$lib/schemas/settings";

const { data } = $props();

$effect(() => {
  if (page.url.searchParams.get("error") === "already_linked") {
    toast.error(m.oauth_error(), {
      description: m.oauth_discord_other_account_connected(),
    });

    const cleanUrl = new URL(page.url);
    cleanUrl.searchParams.delete("error");

    goto(cleanUrl.pathname + cleanUrl.search, {
      replaceState: true,
      keepFocus: true,
    });
  }
});

// svelte-ignore state_referenced_locally: superForms does not accept functions such as `() => data`
const accountForm = superForm(data.accountForm, {
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
// svelte-ignore state_referenced_locally: superForms does not accept functions such as `() => data`
const profileForm = superForm(data.profileForm, {
  validators: zodClient(profileFormSchema),
  invalidateAll: true, // reloads data after update
  resetForm: false,
  onUpdated: ({ form }) => {
    if (form.valid) {
      toast.success("Profile updated successfully");
    }
  },
});

const { form: accountFormData, enhance: accountFormEnhance } = accountForm;
const {
  form: profileFormData,
  enhance: profileEnhance,
  errors: profileErrors,
} = profileForm;

let hiddenFileInput: HTMLInputElement | undefined;

const previewUrl = $derived(
  $profileFormData.avatar instanceof File
    ? URL.createObjectURL($profileFormData.avatar)
    : (data.user?.avatar ?? null),
);

function handleCroppedImage(file: File) {
  $profileFormData.avatar = file;

  if (hiddenFileInput) {
    const dt = new DataTransfer();
    dt.items.add(file);
    hiddenFileInput.files = dt.files;
  }
}

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

<main>
  <div class="space-y-4 mb-2">
    <div class="flex items-center justify-between">
      <div>
        <h4 class="text-sm font-medium">{m.settings_page_profile_title()}</h4>
        <p class="text-xs text-muted-foreground">
          {m.settings_page_profile_description()}
        </p>
      </div>
    </div>

    <div class="flex flex-col gap-4 pb-8">
      <!-- avatar upload -->
      <ImageCropper onCropped={handleCroppedImage}>
        <button
          type="button"
          class="relative h-24 w-24 overflow-hidden rounded-md border-2 border-accent hover:opacity-80 transition-opacity group"
        >
          <Avatar class="w-full h-full rounded-none">
            <AvatarImage class="rounded-none" src={previewUrl} />
            <AvatarFallback class="rounded-none">
              {($profileFormData.username ?? "?").slice(0, 2).toUpperCase()}
            </AvatarFallback>
          </Avatar>

          <div
            class="absolute inset-0 flex items-center justify-center bg-neutral-900/50 text-neutral-50 opacity-0 group-hover:opacity-100 transition-opacity"
          >
            <CameraIcon class="h-6 w-6" />
          </div>
        </button>
      </ImageCropper>

      <form
        id="profileSettingsForm"
        method="POST"
        action="?/profile"
        enctype="multipart/form-data"
        use:profileEnhance
        class="flex-1 md:max-w-md self-start md:self-auto w-full"
      >
        <!-- hidden file input -->
        <input
          type="file"
          name="avatar"
          class="hidden"
          bind:this={hiddenFileInput}
          accept="image/*"
        >

        <!-- username input -->
        <FormField form={profileForm} name="username">
          <FormControl>
            {#snippet children({ props })}
              <FormLabel>{m.settings_page_profile_label_username()}</FormLabel>
              <Input {...props} bind:value={$profileFormData.username} />
            {/snippet}
          </FormControl>
          <FormFieldErrors />
        </FormField>

        <!-- bio input -->
        <FormField form={profileForm} name="bio">
          <FormControl>
            {#snippet children({ props })}
              <FormLabel>{m.settings_page_profile_label_bio()}</FormLabel>
              <Input {...props} bind:value={$profileFormData.bio} />
            {/snippet}
          </FormControl>
          <FormFieldErrors />
        </FormField>

        <Button type="submit" class="mt-4">
          {m.settings_page_button_saved()}
        </Button>
      </form>
    </div>

    <!-- error display -->
    {#if $profileErrors.avatar}
      <Alert variant="destructive" class="border-destructive">
        <CircleAlertIcon />
        <AlertDescription>
          <p>{$profileErrors.avatar[0]}</p>
        </AlertDescription>
      </Alert>
    {/if}

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

    <div
      class="border rounded-lg p-4 flex items-center justify-between max-w-lg"
    >
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
          <Button variant="destructive" size="sm" type="submit">
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

    <div>
      <h4 class="text-sm font-medium">
        {m.settings_page_account_label_password()}
      </h4>
      <p class="text-xs text-muted-foreground">
        {data.hasPassword
          ? m.settings_page_account_label_password_desc()
          : m.settings_page_account_label_no_password_desc()}
      </p>
    </div>

    <form
      method="POST"
      action="?/updatePassword"
      id="pwd-form"
      use:accountFormEnhance
      class="space-y-4 max-w-md"
    >
      {#if data.hasPassword}
        <FormField form={accountForm} name="oldPassword">
          <FormControl>
            {#snippet children({ props })}
              <FormLabel>
                {m.settings_page_account_label_current_password()}
              </FormLabel>
              <Input
                {...props}
                type="password"
                bind:value={$accountFormData.oldPassword}
              />
            {/snippet}
          </FormControl>
          <FormFieldErrors />
        </FormField>
      {/if}

      <FormField form={accountForm} name="newPassword">
        <FormControl>
          {#snippet children({ props })}
            <FormLabel>
              {m.settings_page_account_label_new_password()}
            </FormLabel>
            <Input
              {...props}
              type="password"
              bind:value={$accountFormData.newPassword}
            />
          {/snippet}
        </FormControl>
        <FormFieldErrors />
      </FormField>

      <FormField form={accountForm} name="confirmPassword">
        <FormControl>
          {#snippet children({ props })}
            <FormLabel>
              {m.settings_page_account_label_confirm_password()}
            </FormLabel>
            <Input
              {...props}
              type="password"
              bind:value={$accountFormData.confirmPassword}
            />
          {/snippet}
        </FormControl>
        <FormFieldErrors />
      </FormField>

      <Button type="submit" class="mt-4">
        {m.settings_page_button_saved()}
      </Button>
    </form>

    <h4 class="text-sm font-medium">{m.settings_page_other_title()}</h4>

    <ModeToggle />
    <LanguageSwitcher />
  </div>
</main>
