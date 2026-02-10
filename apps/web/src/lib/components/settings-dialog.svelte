<script lang="ts">
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@transc/ui/dialog";
import { Tabs, TabsList, TabsContent, TabsTrigger } from "@transc/ui/tabs";
import { settingsDialogState, closeSettingsDialog } from "$lib/stores/settings-dialog.svelte";
import ProfileForm from "./profile-form.svelte";
import { page } from "$app/state";

let { form } = $props(); 
</script>

<Dialog open={settingsDialogState.isOpen} onOpenChange={closeSettingsDialog}>
  <DialogContent class="sm:max-w-150">
    <DialogHeader>
      <DialogTitle>Settings</DialogTitle>
      <DialogDescription>
        Manage your account settings and preferences.
      </DialogDescription>
    </DialogHeader>

    <Tabs value="profile" class="w-full">
      <TabsList class="grid w-full grid-cols-3">
        <TabsTrigger value="profile">Profile</TabsTrigger>
        <TabsTrigger value="account">Account Settings</TabsTrigger>
        <TabsTrigger value="app">Website Settings</TabsTrigger>
      </TabsList>

      <TabsContent value="profile">
        {#if page.data.user}
          <ProfileForm data={form} userAvatar={page.data.user.avatar} />
        {:else}
          <p class="py-4 text-center text-muted-foreground">Please log in to manage settings.</p>
        {/if}
      </TabsContent>

      <TabsContent value="account">
        <div class="py-6 text-center text-muted-foreground">
          <p>Account settings (password, OAuth, etc.) coming soon.</p>
        </div>
      </TabsContent>

      <TabsContent value="app">
        <div class="py-6 text-center text-muted-foreground">
          <p>App settings (theme, sounds, etc.) coming soon.</p>
        </div>
      </TabsContent>
    </Tabs>
  </DialogContent>
</Dialog>
