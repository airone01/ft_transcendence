<script lang="ts">
import * as Sidebar from "@transc/ui/components/ui/sidebar/index.ts";
import AppSidebar from "./app-sidebar.svelte";

let { children } = $props();
</script>
 
<Sidebar.Provider>
  <AppSidebar />
  <main class="h-full w-full p-4">
    <Sidebar.Trigger />
    {@render children?.()}
  </main>
</Sidebar.Provider>
