<script lang="ts">
import * as Sidebar from "@transc/ui/components/ui/sidebar/index.ts";
import AppSidebar from "./app-sidebar.svelte";

let { children } = $props();
</script>
 
<Sidebar.Provider class="h-full">
  <AppSidebar />
  <div class="flex flex-col h-full w-full [&>main]:p-4">
    <header class="border-b w-full p-2">
      <Sidebar.Trigger />
    </header>
    {@render children?.()}
  </div>
</Sidebar.Provider>
