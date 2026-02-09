<script lang="ts">
import {
  SidebarProvider,
  SidebarTrigger,
} from "@transc/ui/sidebar";
import AppSidebar from "$lib/components/app-sidebar.svelte";
import { page } from "$app/state";

const { children } = $props();
let open = $state(page.data.sidebarOpen);
$effect(() => {
  // set cookie when bar state changes
  document.cookie = `sidebar:state=${open}; path=/; max-age=31536000; SameSite=Lax`;
});
</script>
 
<SidebarProvider class="h-full" bind:open>
  <AppSidebar />
  <div class="flex flex-col h-full w-full [&>main]:p-4">
    <header class="border-b w-full p-2 h-11">
      <SidebarTrigger class="cursor-pointer" />
    </header>
    {@render children?.()}
  </div>
</SidebarProvider>
