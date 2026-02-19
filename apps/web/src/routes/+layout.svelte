<script lang="ts">
import "./layout.css";
import "@transc/ui/app.css";
import { page } from "$app/state";
import favicon from "$lib/assets/favicon.svg";
import AuthDialog from "$lib/components/auth-dialog.svelte";
import { locales, localizeHref } from "$lib/paraglide/runtime";
import { Toaster } from "@transc/ui/sonner";
import { TooltipProvider } from "@transc/ui/tooltip";
import AppShell from "$lib/components/layout/app-shell.svelte";
import { onMount } from "svelte";
import { initializeSocketListeners } from "$lib/socket-init";
import { socketManager } from "$lib/stores/socket.svelte";

const { children, data } = $props();

onMount(() => {
  if (data.user) {
    socketManager.connect(String(data.user.id), data.user.username);
  }
  initializeSocketListeners();
});
</script>

<svelte:head><link rel="icon" href={favicon} /></svelte:head>

<Toaster />
<AuthDialog />

<TooltipProvider>
  {#if data.user}
    <AppShell>
      {@render children()}
    </AppShell>
  {:else}
    {@render children()}
  {/if}
</TooltipProvider>

<div style="display:none">
	{#each locales as locale}
		<a
			href={localizeHref(page.url.pathname, { locale })}
		>
			{locale}
		</a>
	{/each}
</div>
