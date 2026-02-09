<script lang="ts">
import "./layout.css";
import "@transc/ui/app.css";
import { page } from "$app/state";
import favicon from "$lib/assets/favicon.svg";
import AuthDialog from "$lib/components/auth-dialog.svelte";
import { locales, localizeHref } from "$lib/paraglide/runtime";
import { Toaster } from "@transc/ui/sonner";

const { children } = $props();
</script>

<svelte:head><link rel="icon" href={favicon} /></svelte:head>
<Toaster />
<AuthDialog />
{@render children()}

<div style="display:none">
	{#each locales as locale}
		<a
			href={localizeHref(page.url.pathname, { locale })}
		>
			{locale}
		</a>
	{/each}
</div>
