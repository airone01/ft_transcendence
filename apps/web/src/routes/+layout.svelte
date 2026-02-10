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
import SettingsDialog from "$lib/components/settings-dialog.svelte";

const { children, data } = $props();
</script>

<svelte:head><link rel="icon" href={favicon} /></svelte:head>

<Toaster />
<AuthDialog />
<SettingsDialog form={data.settingsForm} />

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
