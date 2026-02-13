<script lang="ts">
import type { Snippet } from "svelte";

export let title: string;
export let description: string;
export let children: Snippet<[]> | undefined;
</script>

<div class="flex flex-col">
  <div class="pb-8">
    <h3 class="text-lg font-medium">{title}</h3>
    <p class="text-sm text-muted-foreground">
      {description}
    </p>
  </div>

  <div class="flex flex-col gap-8 md:flex-row md:items-start">
    {@render children?.()}
  </div>
</div>
