<script lang="ts">
import {
  Provider as SidebarProvider,
  Trigger as SidebarTrigger,
} from "@transc/ui/components/ui/sidebar/index.ts";
import AppSidebar from "./app-sidebar.svelte";

const { children } = $props();
</script>
 
<SidebarProvider class="h-full">
  <AppSidebar />
  <div class="flex flex-col h-full w-full [&>main]:p-4">
    <header class="border-b w-full p-2">
      <SidebarTrigger class="cursor-pointer" />
    </header>
    {@render children?.()}
  </div>
</SidebarProvider>
