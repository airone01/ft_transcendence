<script lang="ts">
import {
  cn,
  type WithElementRef,
  type WithoutChildren,
} from "@transc/ui/utils";
import type { HTMLAttributes } from "svelte/elements";

let {
  ref = $bindable(null),
  class: className,
  ...restProps
}: WithoutChildren<WithElementRef<HTMLAttributes<HTMLDivElement>>> = $props();
</script>

<div
  bind:this={ref}
  data-slot="skeleton"
  class={cn("bg-muted animate-pulse rounded-md", className)}
  {...restProps}
></div>
