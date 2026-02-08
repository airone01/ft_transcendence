<script lang="ts">
  import AppShell from "$lib/components/layout/app-shell.svelte";
  let { children } = $props();
</script>

<AppShell>
  {@render children()}
</AppShell>
