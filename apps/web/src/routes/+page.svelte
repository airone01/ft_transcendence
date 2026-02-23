<script lang="ts">
import LandingPage from "$lib/components/landing/landing-page.svelte";

const { data } = $props();
</script>

{#if data.user}
  <main></main>
{:else}
  <LandingPage />
{/if}
