<script lang="ts">
import { cn } from "@transc/ui/utils";
import type { DropdownMenu as DropdownMenuPrimitive } from "bits-ui";

const {
  ref = $bindable(null),
  class: className,
  ...restProps
}: DropdownMenuPrimitive.SeparatorProps = $props();
</script>

<DropdownMenuPrimitive.Separator
  bind:ref
  data-slot="dropdown-menu-separator"
  class={cn("bg-border -mx-1 my-1 h-px", className)}
  {...restProps}
/>
