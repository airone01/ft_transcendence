<script lang="ts">
import { Button } from "@transc/ui/button";
import type { Snippet } from "svelte";
import type { Readable } from "svelte/store";

export let title: string;
export let description: string;
export let children: Snippet<[]> | undefined;
export let delayed: Readable<boolean>;
export let formId: string;
</script>

<div class="flex flex-col gap-4 min-h-0 flex-1">
  <div>
    <h3 class="text-lg font-medium">{title}</h3>
    <p class="text-sm text-muted-foreground">{description}</p>
  </div>

  {@render children?.()}

  <div class="flex justify-end">
    <Button
      form={formId}
      type="submit"
      disabled={$delayed}
      class="cursor-pointer"
    >
      {#if $delayed}
        Saving...
      {:else}
        Save Changes
      {/if}
    </Button>
  </div>
</div>
