<script lang="ts">
import { cn } from "@transc/ui/utils";
import type { Command as CommandPrimitive } from "bits-ui";

export type CommandRootApi = CommandPrimitive.Root;

const {
  api = $bindable(null),
  ref = $bindable(null),
  value = $bindable(""),
  class: className,
  ...restProps
}: CommandPrimitive.RootProps & {
  api?: CommandRootApi | null;
} = $props();
</script>

<CommandPrimitive.Root
  bind:this={api}
  bind:value
  bind:ref
  data-slot="command"
  class={cn(
		"bg-popover text-popover-foreground flex h-full w-full flex-col overflow-hidden rounded-md",
		className
	)}
  {...restProps}
/>
