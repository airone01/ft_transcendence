<script lang="ts">
import { cn, type WithElementRef } from "@transc/ui/utils";
import type { HTMLAttributes } from "svelte/elements";

const {
  ref = $bindable(null),
  class: className,
  children,
  ...restProps
}: WithElementRef<HTMLAttributes<HTMLDivElement>> = $props();
</script>

<div
  bind:this={ref}
  data-slot="item-header"
  class={cn("flex basis-full items-center justify-between gap-2", className)}
  {...restProps}
>
  {@render children?.()}
</div>
