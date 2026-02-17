<script lang="ts">
import { SidebarProvider, SidebarTrigger } from "@transc/ui/sidebar";
import { CommandDialog, CommandInput, CommandList, CommandEmpty, CommandGroup, CommandSeparator, CommandItem } from "@transc/ui/command"
import { CreditCardIcon, SettingsIcon, SmileIcon, UserIcon } from "@lucide/svelte";
import AppSidebar from "$lib/components/app-sidebar.svelte";
import { page } from "$app/state";
import type { Component } from "svelte";
    import { goto } from "$app/navigation";

const { children } = $props();

let sidebarOpen = $state(page.data.sidebarOpen);
$effect(() => {
  // set cookie when bar state changes
  document.cookie = `sidebar:state=${sidebarOpen}; path=/; max-age=31536000; SameSite=Lax`;
});

let commandOpen = $state(false);
function handleKeydown(e: KeyboardEvent) {
  if (e.key === "k" && (e.metaKey || e.ctrlKey)) {
    e.preventDefault();
    commandOpen = !commandOpen;
  }
}

function runCommand(url: string) {
  commandOpen = false;
  goto(url);
}

type Item = {
  label: string;
  navUrl: string;
  icon?: Component;
}
type Group = {
  heading: string;
  items: Item[];
}

const groups: Group[] = [
  {
    heading: "Navigation",
    items: [
      { label: "My Profile", navUrl: "/profile/me", icon: UserIcon },
    ]
  }
];
</script>

<svelte:document onkeydown={handleKeydown} />

<CommandDialog bind:open={commandOpen}>
  <CommandInput placeholder="Type a command or search..." />
  <CommandList>
    <CommandEmpty>No results found.</CommandEmpty>
    {#each groups as {items, heading}}
      <CommandGroup {heading}>
        {#each items as {navUrl, label, ...item}}
          <CommandItem onSelect={() => runCommand(navUrl)}>
            <item.icon class="me-2 size-4"></item.icon>
            <span>{label}</span>
          </CommandItem>
        {/each}
      </CommandGroup>
      <!-- {#if } -->
      <CommandSeparator />
      <!-- {/if} -->
    {/each}
  </CommandList>
</CommandDialog>
 
<SidebarProvider class="h-full" bind:open={sidebarOpen}>
  <AppSidebar />
  <div class="flex flex-col h-full w-full [&>main]:p-4 [&>main]:mt-11">
    <header class="border-b w-full p-2 h-11 fixed bg-background">
      <SidebarTrigger class="cursor-pointer" />
    </header>
    {@render children?.()}
  </div>
</SidebarProvider>
