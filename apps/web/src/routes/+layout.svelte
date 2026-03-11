<script lang="ts">
import "./layout.css";
import "@transc/ui/app.css";
import { Toaster } from "@transc/ui/sonner";
import { TooltipProvider } from "@transc/ui/tooltip";
import { ModeWatcher } from "mode-watcher";
import { onMount } from "svelte";
import { goto } from "$app/navigation";
import { page } from "$app/state";
import favicon from "$lib/assets/favicon.svg";
import AuthDialog from "$lib/components/auth-dialog.svelte";
import AppShell from "$lib/components/layout/app-shell.svelte";
import * as m from "$lib/paraglide/messages";
import { locales, localizeHref } from "$lib/paraglide/runtime";
import { initializeSocketListeners } from "$lib/socket-init";
import { socketConnected, socketManager } from "$lib/stores/socket.svelte";
import "@fontsource-variable/merriweather";
import "@fontsource-variable/montserrat";
import "@fontsource-variable/source-code-pro";

const { children, data } = $props();

let listenersInitialized = false;
let connectionInitialized = false;

$effect(() => {
  if (data.user && !connectionInitialized) {
    connectionInitialized = true;
    socketManager.connect();
  }

  if (data.user && $socketConnected && !listenersInitialized) {
    initializeSocketListeners(data.user.id);
    listenersInitialized = true;
  }
});

onMount(() => {
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
  <title>{m.project_name()}</title>
</svelte:head>

<Toaster />
<AuthDialog />
<ModeWatcher />

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
