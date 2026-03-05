<script lang="ts">
import { Button } from "@transc/ui/button";
import type { Snippet } from "svelte";
import type { Readable } from "svelte/store";
import * as m from "$lib/paraglide/messages.js";

type Props = {
  title: string;
  description: string;
  children?: Snippet<[]>;
  delayed: Readable<boolean>;
  formId: string;
};

const { title, description, children, delayed, formId }: Props = $props();
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
        {m.settings_page_button_saving()}
      {:else}
        {m.settings_page_button_saved()}
      {/if}
    </Button>
  </div>
</div>
