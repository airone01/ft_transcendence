<script lang="ts">
import { superForm } from "sveltekit-superforms";
import { zodClient } from "sveltekit-superforms/adapters";
import { toast } from "svelte-sonner";
import { profileFormSchema } from "$lib/schemas/settings";
import { Input } from "@transc/ui/input";
import { Button } from "@transc/ui/button";
import * as Form from "@transc/ui/form";
import { ImageCropper } from "@transc/ui/image-cropper";
import { CameraIcon } from "@lucide/svelte";
import { Avatar, AvatarFallback, AvatarImage } from "@transc/ui/avatar";
import SettingsHeader from "$lib/components/settings-header.svelte";

let { data } = $props();

const form = superForm(data.form, {
  validators: zodClient(profileFormSchema),
  invalidateAll: true, // reloads data.user after update
  onUpdated: ({ form }) => {
    if (form.valid) {
      toast.success("Profile updated successfully");
    }
  }
});

const { form: formData, enhance, delayed } = form;

let hiddenFileInput: HTMLInputElement | undefined;

let previewUrl = $derived(
  $formData.avatar instanceof File 
    ? URL.createObjectURL($formData.avatar) 
    : (data.user?.avatar ?? null)
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

<SettingsHeader title="Profile" description="This is how others will see you on the site.">
  <div class="flex flex-col items-center gap-4">
    <ImageCropper onCropped={handleCroppedImage}>
      <button 
        type="button"
        class="relative h-24 w-24 overflow-hidden rounded-md ring-2 ring-primary hover:opacity-80 transition-opacity group"
      >
        <Avatar class="w-full h-full rounded-none">
          <AvatarImage class="rounded-none" src={previewUrl} />
          <AvatarFallback class="rounded-none">{($formData.username ?? "?").slice(0, 2).toUpperCase()}</AvatarFallback>
        </Avatar>
        
        <div class="absolute inset-0 flex items-center justify-center bg-black/50 text-white opacity-0 group-hover:opacity-100 transition-opacity">
          <CameraIcon class="h-6 w-6" />
        </div>
      </button>
    </ImageCropper>
  </div>

  <form 
    method="POST" 
    action="/settings/profile" 
    enctype="multipart/form-data" 
    use:enhance 
    class="flex-1 max-w-md"
  >
    <input 
      type="file" 
      name="avatar" 
      class="hidden" 
      bind:this={hiddenFileInput} 
      accept="image/*" 
    />

    <Form.Field {form} name="username">
      <Form.Control>
        {#snippet children({ props })}
          <Form.Label>Username</Form.Label>
          <Input {...props} bind:value={$formData.username} />
        {/snippet}
      </Form.Control>
      <Form.FieldErrors />
    </Form.Field>

    <div class="flex justify-end pt-4">
      <Button type="submit" disabled={$delayed}>
        {#if $delayed}Saving...{:else}Save Changes{/if}
      </Button>
    </div>
  </form>
</SettingsHeader>
