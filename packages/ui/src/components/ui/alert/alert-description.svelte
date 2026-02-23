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
  data-slot="alert-description"
  class={cn(
		"text-muted-foreground col-start-2 grid justify-items-start gap-1 text-sm [&_p]:leading-relaxed",
		className
	)}
  {...restProps}
>
  {@render children?.()}
</div>
