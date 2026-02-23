<script lang="ts">
import { CameraIcon, CircleAlertIcon } from "@lucide/svelte";
import { Alert, AlertDescription } from "@transc/ui/alert";
import { Avatar, AvatarFallback, AvatarImage } from "@transc/ui/avatar";
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
import SettingsHeader from "$lib/components/settings-header.svelte";
import { profileFormSchema } from "$lib/schemas/settings";

const { data } = $props();

// svelte-ignore state_referenced_locally: superForms does not accept functions such as `() => data`
const form = superForm(data.form, {
  validators: zodClient(profileFormSchema),
  invalidateAll: true, // reloads data after update
  resetForm: false,
  onUpdated: ({ form }) => {
    if (form.valid) {
      toast.success("Profile updated successfully");
    }
  },
});

const { form: formData, enhance, delayed, errors } = form;

let hiddenFileInput: HTMLInputElement | undefined;

const previewUrl = $derived(
  $formData.avatar instanceof File
    ? URL.createObjectURL($formData.avatar)
    : (data.user?.avatar ?? null),
);

function handleCroppedImage(file: File) {
  $formData.avatar = file;

  if (hiddenFileInput) {
    const dt = new DataTransfer();
    dt.items.add(file);
    hiddenFileInput.files = dt.files;
  }
}
</script>

<SettingsHeader
  title="Profile"
  description="This is how others will see you on the site."
  formId="profileSettingsForm"
  {delayed}
>
  <div class="flex flex-col md:flex-row md:items-end gap-4 items-center">
    <!-- avatar upload -->
    <ImageCropper onCropped={handleCroppedImage}>
      <button
        type="button"
        class="relative h-24 w-24 overflow-hidden rounded-md border-2 border-accent hover:opacity-80 transition-opacity group"
      >
        <Avatar class="w-full h-full rounded-none">
          <AvatarImage class="rounded-none" src={previewUrl} />
          <AvatarFallback class="rounded-none">
            {($formData.username ?? "?").slice(0, 2).toUpperCase()}
          </AvatarFallback>
        </Avatar>

        <div
          class="absolute inset-0 flex items-center justify-center bg-neutral-900/50 text-neutral-50 opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer"
        >
          <CameraIcon class="h-6 w-6" />
        </div>
      </button>
    </ImageCropper>

    <!-- username input -->
    <form
      id="profileSettingsForm"
      method="POST"
      action="/settings/profile"
      enctype="multipart/form-data"
      use:enhance
      class="flex-1 md:max-w-md self-start md:self-auto w-full"
    >
      <input
        type="file"
        name="avatar"
        class="hidden"
        bind:this={hiddenFileInput}
        accept="image/*"
      >

      <FormField {form} name="username">
        <FormControl>
          {#snippet children({ props })}
            <FormLabel>
              Username<!-- i18n --><!-- i18n -->
              <!-- i18n --><!-- i18n -->
            </FormLabel>
            <Input {...props} bind:value={$formData.username} />
          {/snippet}
        </FormControl>
        <FormFieldErrors />
      </FormField>
    </form>
  </div>

  <!-- error display -->
  {#if $errors.avatar}
    <Alert variant="destructive" class="border-destructive">
      <CircleAlertIcon />
      <AlertDescription>
        <p>{$errors.avatar[0]}</p>
      </AlertDescription>
    </Alert>
  {/if}
</SettingsHeader>
