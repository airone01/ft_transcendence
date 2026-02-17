<script lang="ts">
import { SidebarProvider, SidebarTrigger } from "@transc/ui/sidebar";
import { CommandDialog, CommandInput, CommandList, CommandEmpty, CommandGroup, CommandSeparator, CommandItem } from "@transc/ui/command"
import AppSidebar from "$lib/components/app-sidebar.svelte";
import { page } from "$app/state";
import { goto } from "$app/navigation";
import { naturalCap, sidebarGroups, type ShellGroup } from "$lib/navigation";
import { toast } from "svelte-sonner";
import { enhance } from "$app/forms";
import { invalidateAll } from "$app/navigation";
import { BotIcon, LogOutIcon, SettingsIcon, ZapIcon } from "@lucide/svelte";

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

const logoutFunc = () => {
  return async ({ result }: any) => {
    if (result.type === 'redirect' || result.type === 'success') {
      toast.success("You logged out. See you soon!");
      await invalidateAll(); // invalidates data to redraw interface
    } else {
      toast.error("Failed to log out");
    }
  };
};

let logoutForm: HTMLFormElement | undefined = $state();

const commandGroups: ShellGroup[] = [
  ...sidebarGroups
    .map(({ label, items }) => ({
      heading: label === "My Content" ? "Quick navigation" : naturalCap(label),
      items: items.map((e) => {
        const { href, label, ...el } = e;
        return {
          navUrl: href,
          label: naturalCap(label),
          ...el,
        };
      }),
    }))
    .filter((e) => e.heading !== "Chess"),
  {
    heading: "Start a game",
    items: [
      { label: "Start ranked match making", navUrl: "/play", icon: ZapIcon },
      { label: "Start a game against AI", navUrl: "/play/bot", icon: BotIcon },
    ],
  },
  {
    heading: "Account",
    items: [
      {
        label: "Settings",
        navUrl: "/settings",
        icon: SettingsIcon,
      },
      { label: "Log out", icon: LogOutIcon, onClick: () => logoutForm?.requestSubmit() },
    ],
  },
];
</script>

<svelte:document onkeydown={handleKeydown} />

<form 
  action="/logout" 
  method="POST" 
  bind:this={logoutForm}
  use:enhance={logoutFunc}
></form>

<CommandDialog bind:open={commandOpen}>
  <CommandInput placeholder="Type a command or search..." />
  <CommandList>
    <CommandEmpty>No results found.</CommandEmpty>
    {#each commandGroups as {items, heading}, i (heading)}
      <CommandGroup {heading}>
        {#each items as {navUrl, label, onClick, ...item} (label)}
          <CommandItem onSelect={onClick ? onClick : (navUrl ? (() => runCommand(navUrl)) : undefined)}>
            <item.icon class="me-2 size-4"></item.icon>
            <span>{label}</span>
          </CommandItem>
        {/each}
      </CommandGroup>
      {#if i+1 > commandGroups.length}
        <CommandSeparator />
      {/if}
    {/each}
  </CommandList>
</CommandDialog>
 
<SidebarProvider class="h-full" bind:open={sidebarOpen}>
  <AppSidebar {logoutForm} />
  <div class="flex flex-col h-full w-full [&>main]:p-4 [&>main]:mt-11">
    <header class="border-b w-full p-2 h-11 fixed bg-background">
      <SidebarTrigger class="cursor-pointer" />
    </header>
    {@render children?.()}
  </div>
</SidebarProvider>
