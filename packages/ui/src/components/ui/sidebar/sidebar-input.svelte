<script lang="ts">
import type { Input } from "@transc/ui/input";
import { cn } from "@transc/ui/utils";
import type { ComponentProps } from "svelte";

const {
  ref = $bindable(null),
  value = $bindable(""),
  class: className,
  ...restProps
}: ComponentProps<typeof Input> = $props();
</script>

<Input
  bind:ref
  bind:value
  data-slot="sidebar-input"
  data-sidebar="input"
  class={cn("bg-background h-8 w-full shadow-none", className)}
  {...restProps}
/>
