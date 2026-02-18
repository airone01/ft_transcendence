<script lang="ts">
import { Button } from "@transc/ui/button";
import type { Snippet } from "svelte";
import { type Readable } from "svelte/store";
import { m } from "$lib/paraglide/messages";

export let title: string;
export let description: string;
export let children: Snippet<[]> | undefined;
export let delayed: Readable<boolean>;
export let formId: string;
</script>

<div class="flex flex-col gap-4 min-h-0 flex-1">
  <div>
    <h3 class="text-lg font-medium">{title}</h3>
    <p class="text-sm text-muted-foreground">
      {description}
    </p>
  </div>

  {@render children?.()}

  <div class="flex justify-end">
    <Button form={formId} type="submit" disabled={$delayed} class="cursor-pointer">
      {#if $delayed}{m.settings_saving()}{:else}{m.settings_save()}{/if}
    </Button>
  </div>
</div>
