<script lang="ts">
import { cn } from "@transc/ui/utils";
import type { Dialog as DialogPrimitive } from "bits-ui";

const {
  ref = $bindable(null),
  class: className,
  ...restProps
}: DialogPrimitive.DescriptionProps = $props();
</script>

<DialogPrimitive.Description
  bind:ref
  data-slot="dialog-description"
  class={cn("text-muted-foreground text-sm", className)}
  {...restProps}
/>
