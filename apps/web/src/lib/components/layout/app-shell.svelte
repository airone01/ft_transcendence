<script lang="ts">
import { BotIcon, LogOutIcon, SettingsIcon, ZapIcon } from "@lucide/svelte";
import type { SubmitFunction } from "@sveltejs/kit";
import {
  CommandDialog,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
  CommandSeparator,
} from "@transc/ui/command";
import { SidebarProvider, SidebarTrigger } from "@transc/ui/sidebar";
import { toast } from "svelte-sonner";
import { enhance } from "$app/forms";
import { goto, invalidateAll } from "$app/navigation";
import { page } from "$app/state";
import AppSidebar from "$lib/components/app-sidebar.svelte";
import { naturalCap, type ShellGroup, sidebarGroups } from "$lib/navigation";

const { children } = $props();

let logoutForm: HTMLFormElement | undefined = $state();
let commandInput: string = $state("");
let sidebarOpen: boolean = $state(page.data.sidebarOpen);
let commandOpen: boolean = $state(false);

$effect(() => {
  // set cookie when bar state changes
  // biome-ignore lint/suspicious/noDocumentCookie: can't use CookieStore because $effect can't be async
  document.cookie = `sidebar:state=${sidebarOpen}; path=/; max-age=31536000; SameSite=Lax`;
});

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

const logoutFunc: SubmitFunction = () => {
  return async ({ result }) => {
    if (result.type === "redirect" || result.type === "success") {
      toast.success("You logged out. See you soon!");
      await invalidateAll(); // invalidates data to redraw interface
    } else {
      toast.error("Failed to log out");
    }
  };
};

$effect(() => {
  if (commandInput.toLowerCase() === "secretcat")
    window.location =
      "https://i.pinimg.com/originals/20/69/fd/2069fd0482fe844c802fd3cc76f39045.jpg" as string &
        Location;
});

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
      {
        label: "Log out",
        icon: LogOutIcon,
        onClick: () => logoutForm?.requestSubmit(),
      },
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
  <CommandInput
    bind:value={commandInput}
    placeholder="Type a command or search.."
  />
  <CommandList>
    <CommandEmpty>No results found.</CommandEmpty>
    {#each commandGroups as {items, heading}, i (heading)}
      <CommandGroup {heading}>
        {#each items as {navUrl, label, onClick, ...item} (label)}
          <CommandItem
            onSelect={onClick ? onClick : (navUrl ? (() => runCommand(navUrl)) : undefined)}
            class="cursor-pointer aria-selected:bg-accent/60"
          >
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
    <header
      class="border-b w-full p-2 h-11 fixed bg-background/40 backdrop-blur-md z-10"
    >
      <SidebarTrigger class="cursor-pointer" />
    </header>
    {@render children?.()}
  </div>
</SidebarProvider>
