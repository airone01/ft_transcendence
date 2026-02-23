<script lang="ts">
import type { Separator } from "@transc/ui/separator";
import { cn } from "@transc/ui/utils";
import type { ComponentProps } from "svelte";

const {
  ref = $bindable(null),
  class: className,
  ...restProps
}: ComponentProps<typeof Separator> = $props();
</script>

<Separator
  bind:ref
  data-slot="sidebar-separator"
  data-sidebar="separator"
  class={cn("bg-sidebar-border", className)}
  {...restProps}
/>
