<script lang="ts">
import { cn } from "@transc/ui/utils";
import type { Command as CommandPrimitive } from "bits-ui";

const {
  ref = $bindable(null),
  class: className,
  ...restProps
}: CommandPrimitive.ListProps = $props();
</script>

<CommandPrimitive.List
  bind:ref
  data-slot="command-list"
  class={cn("max-h-75 scroll-py-1 overflow-x-hidden overflow-y-auto", className)}
  {...restProps}
/>
