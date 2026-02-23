<script lang="ts">
import { cn } from "@transc/ui/utils";
import type { Tabs as TabsPrimitive } from "bits-ui";

const {
  ref = $bindable(null),
  class: className,
  ...restProps
}: TabsPrimitive.ContentProps = $props();
</script>

<TabsPrimitive.Content
  bind:ref
  data-slot="tabs-content"
  class={cn("flex-1 outline-none", className)}
  {...restProps}
/>
