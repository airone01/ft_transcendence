<script lang="ts">
import { FormField, FormControl, FormLabel, FormFieldErrors } from '@transc/ui/form';
import { Input } from "@transc/ui/input"
import { Button } from "@transc/ui/button"
import { profileFormSchema, type ProfileFormSchema } from "$lib/schemas/settings";
import { type SuperValidated, type Infer, superForm } from "sveltekit-superforms";
import { zodClient } from "sveltekit-superforms/adapters";
import { toast } from "svelte-sonner"; // Assuming you have a toast library

let { data, userAvatar }: { data: SuperValidated<Infer<ProfileFormSchema>>, userAvatar: string | null } = $props();

const form = superForm(data, {
  validators: zodClient(profileFormSchema),
    onUpdated: ({ form }) => {
      if (form.valid) {
        toast.success("Profile updated successfully");
      }
    }
});

const { form: formData, enhance, delayed } = form;
</script>

<div class="space-y-6 py-4">
  <div class="flex flex-col items-center gap-4">
    <button 
      type="button"
      class="relative h-24 w-24 overflow-hidden rounded-full border-2 border-border hover:opacity-80 transition-opacity"
      onclick={() => alert("Avatar modal coming soon!")}
    >
      {#if userAvatar}
        <img src={userAvatar} alt="Avatar" class="h-full w-full object-cover" />
      {:else}
        <div class="flex h-full w-full items-center justify-center bg-muted text-3xl">?</div>
      {/if}
      <div class="absolute inset-0 flex items-center justify-center bg-black/50 text-white opacity-0 hover:opacity-100 transition-opacity text-xs font-medium">
        Edit
      </div>
    </button>
    <span class="text-sm text-muted-foreground">Click avatar to change</span>
  </div>

  <form method="POST" action="/settings?/updateProfile" use:enhance class="space-y-4">
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
