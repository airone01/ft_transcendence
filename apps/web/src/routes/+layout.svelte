<script lang="ts">
import "./layout.css";
import "@transc/ui/app.css";
import { Toaster } from "@transc/ui/sonner";
import { TooltipProvider } from "@transc/ui/tooltip";
import { onMount } from "svelte";
import { page } from "$app/state";
import { goto } from "$app/navigation";
import favicon from "$lib/assets/favicon.svg";
import AuthDialog from "$lib/components/auth-dialog.svelte";
import AppShell from "$lib/components/layout/app-shell.svelte";
import { locales, localizeHref } from "$lib/paraglide/runtime";
import { initializeSocketListeners } from "$lib/socket-init";
import { socketManager } from "$lib/stores/socket.svelte";

const { children, data } = $props();

onMount(() => {
  if (data.user) {
    socketManager.connect(String(data.user.id), data.user.username);
  }
  initializeSocketListeners();

  socketManager.on('game:reconnected', (eventData: any) => {
    const { gameId } = eventData as { gameId: string };
    const currentPath = page.url.pathname;
    
    if (!currentPath.includes(`/game/${gameId}`)) {
      console.log(`[Redirect] Going to /game/${gameId}`);
      goto(`/game/${gameId}`);
    }
  });

  return () => {
    socketManager.off('game:reconnected');
  };
});
</script>

<svelte:head>
  <link rel="icon" href={favicon}>
  <title>transc</title>
</svelte:head>

<Toaster />
<AuthDialog />

<TooltipProvider>
  {#if data.user}
    <AppShell>{@render children()}</AppShell>
  {:else}
    {@render children()}
  {/if}
</TooltipProvider>

<div style="display:none">
  {#each locales as locale}
    <a href={localizeHref(page.url.pathname, { locale })}> {locale} </a>
  {/each}
</div>