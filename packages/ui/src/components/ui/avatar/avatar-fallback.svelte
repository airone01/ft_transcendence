<script lang="ts">
import { cn } from "@transc/ui/utils";
import type { Avatar as AvatarPrimitive } from "bits-ui";

const {
  ref = $bindable(null),
  class: className,
  ...restProps
}: AvatarPrimitive.FallbackProps = $props();
</script>

<AvatarPrimitive.Fallback
  bind:ref
  data-slot="avatar-fallback"
  class={cn("bg-muted flex size-full items-center justify-center rounded-full", className)}
  {...restProps}
/>
