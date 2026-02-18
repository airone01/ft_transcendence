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
import { m } from "$lib/paraglide/messages";

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
      toast.success(m.toast_logged_out());
      await invalidateAll(); // invalidates data to redraw interface
    } else {
      toast.error(m.toast_logged_out_failed());
    }
  };
};

let logoutForm: HTMLFormElement | undefined = $state();
let commandInput: string = $state("");

$effect(() => {
  if (commandInput.toLowerCase() === 'secretcat')
    window.location = "https://i.pinimg.com/originals/20/69/fd/2069fd0482fe844c802fd3cc76f39045.jpg" as string & Location;
})

const commandGroups: ShellGroup[] = [
  ...sidebarGroups
    .map(({ label, items }) => ({
      heading: label === m.nav_head_mycontent() ? m.nav_head_quicknav() : naturalCap(label),
      items: items.map((e) => {
        const { href, label, ...el } = e;
        return {
          navUrl: href,
          label: naturalCap(label),
          ...el,
        };
      }),
    }))
    .filter((e) => e.heading !== m.nav_head_chess()),
  {
    heading: m.nav_head_startgame(),
    items: [
      { label: m.nav_item_startmm(), navUrl: "/play", icon: ZapIcon },
      { label: m.nav_item_startbot(), navUrl: "/play/bot", icon: BotIcon },
    ],
  },
  {
    heading: m.nav_head_account(),
    items: [
      {
        label: m.nav_item_settings(),
        navUrl: "/settings",
        icon: SettingsIcon,
      },
      { label: m.auth_logout(), icon: LogOutIcon, onClick: () => logoutForm?.requestSubmit() },
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
  <CommandInput bind:value={commandInput} placeholder={m.nav_cmd_query()} />
  <CommandList>
    <CommandEmpty>{m.nav_cmd_nores()}</CommandEmpty>
    {#each commandGroups as {items, heading}, i (heading)}
      <CommandGroup {heading}>
        {#each items as {navUrl, label, onClick, ...item} (label)}
          <CommandItem onSelect={onClick ? onClick : (navUrl ? (() => runCommand(navUrl)) : undefined)} class="cursor-pointer aria-selected:bg-accent/60">
            <item.icon class="me-2 size-4 text-accent-foreground"></item.icon>
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
    <header class="border-b w-full p-2 h-11 fixed bg-background/40 backdrop-blur-md z-10">
      <SidebarTrigger class="cursor-pointer" />
    </header>
    {@render children?.()}
  </div>
</SidebarProvider>
