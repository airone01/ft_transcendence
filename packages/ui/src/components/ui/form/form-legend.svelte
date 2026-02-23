<script lang="ts">
import { cn, type WithoutChild } from "@transc/ui/utils";
import type * as FormPrimitive from "formsnap";

const {
  ref = $bindable(null),
  class: className,
  ...restProps
}: WithoutChild<FormPrimitive.LegendProps> = $props();
</script>

<FormPrimitive.Legend
  bind:ref
  class={cn("data-[fs-error]:text-destructive text-sm leading-none font-medium", className)}
  {...restProps}
/>
