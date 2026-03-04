<script lang="ts">
import "./layout.css";
import "@transc/ui/app.css";
import { Toaster } from "@transc/ui/sonner";
import { TooltipProvider } from "@transc/ui/tooltip";
import { onMount } from "svelte";
import { goto } from "$app/navigation";
import { page } from "$app/state";
import favicon from "$lib/assets/favicon.svg";
import AuthDialog from "$lib/components/auth-dialog.svelte";
import AppShell from "$lib/components/layout/app-shell.svelte";
import { locales, localizeHref } from "$lib/paraglide/runtime";
import { initializeSocketListeners } from "$lib/socket-init";
import { socketManager } from "$lib/stores/socket.svelte";

const { children, data } = $props();

$effect(() => {
  if (data.user) {
    socketManager.connect(String(data.user.id), data.user.username);
  }
});

onMount(() => {
  initializeSocketListeners();

  socketManager.on("game:reconnected", (eventData: unknown) => {
    const { gameId, isSpectator = false } = eventData as {
      gameId: string;
      isSpectator?: boolean;
    };

    if (isSpectator) {
      console.log(
        `[Redirect] Skipping redirect, user is spectator of game ${gameId}`,
      );
      return;
    }

    const currentPath = page.url.pathname;

    if (!currentPath.includes(`/game/${gameId}`)) {
      console.log(`[Redirect] Going to /game/${gameId}`);
      goto(`/game/${gameId}`);
    }
  });

  return () => {
    socketManager.off("game:reconnected");
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
