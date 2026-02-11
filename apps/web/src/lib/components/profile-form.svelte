<script lang="ts">
import { FormField, FormControl, FormLabel, FormFieldErrors } from '@transc/ui/form';
import { Input } from "@transc/ui/input"
import { Button } from "@transc/ui/button"
import { ImageCropper } from "@transc/ui/image-cropper"
import { profileFormSchema, type ProfileFormSchema } from "$lib/schemas/settings";
import { type SuperValidated, type Infer, superForm } from "sveltekit-superforms";
import { zodClient } from "sveltekit-superforms/adapters";
import { toast } from "svelte-sonner";
import { CameraIcon } from '@lucide/svelte';
import { closeSettingsDialog } from '$lib/stores/settings-dialog.svelte';

let { data, userAvatar }: { data: SuperValidated<Infer<ProfileFormSchema>>, userAvatar: string | null } = $props();

const form = superForm(data, {
  validators: zodClient(profileFormSchema),
  invalidateAll: true,
  onUpdated: ({ form }) => {
    if (form.valid) {
      toast.success("Profile updated successfully");
      closeSettingsDialog();
    }
  }
});
const { form: formData, enhance, delayed } = form;

let hiddenFileInput: HTMLInputElement | undefined;
let localFile = $state<File | null>(null);
let previewUrl = $derived(localFile ? URL.createObjectURL(localFile) : userAvatar);

function handleCroppedImage(file: File) {
  $formData.avatar = file;
  localFile = file;

  if (hiddenFileInput) {
    const dt = new DataTransfer();
    dt.items.add(file);
    hiddenFileInput.files = dt.files;
  }
}
</script>

<div class="space-y-6 py-4">
  <div class="flex flex-col items-center gap-4">
    <ImageCropper onCropped={handleCroppedImage}>
      <button 
        type="button"
        class="relative h-24 w-24 overflow-hidden rounded-full border-2 border-border hover:opacity-80 transition-opacity group"
      >
        {#if previewUrl}
          <img src={previewUrl} alt="Avatar" class="h-full w-full object-cover" />
        {:else}
          <div class="flex h-full w-full items-center justify-center bg-muted text-3xl font-bold">
            {($formData.username ?? "?").slice(0, 2).toUpperCase()}
          </div>
        {/if}
        
        <div class="absolute inset-0 flex items-center justify-center bg-black/50 text-white opacity-0 group-hover:opacity-100 transition-opacity">
          <CameraIcon class="h-6 w-6" />
        </div>
      </button>
    </ImageCropper>
    <span class="text-xs text-muted-foreground">Click avatar to upload</span>
  </div>

  <form method="POST" action="/settings?/updateProfile" enctype="multipart/form-data" use:enhance class="space-y-4">
    <input 
      type="file" 
      name="avatar" 
      class="hidden" 
      bind:this={hiddenFileInput} 
      accept="image/*" 
    />

    <FormField {form} name="username">
      <FormControl>
        {#snippet children({ props })}
          <FormLabel>Username</FormLabel>
          <Input {...props} bind:value={$formData.username} />
        {/snippet}
      </FormControl>
      <FormFieldErrors />
    </FormField>

    <div class="flex justify-end">
      <Button type="submit" disabled={$delayed}>
        {#if $delayed}Saving...{:else}Save Changes{/if}
      </Button>
    </div>
  </form>
</div>
