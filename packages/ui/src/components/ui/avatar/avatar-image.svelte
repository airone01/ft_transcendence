<script lang="ts">
import { cn } from "@transc/ui/utils";
import type { Avatar as AvatarPrimitive } from "bits-ui";

const {
  ref = $bindable(null),
  class: className,
  ...restProps
}: AvatarPrimitive.ImageProps = $props();
</script>

<AvatarPrimitive.Image
  bind:ref
  data-slot="avatar-image"
  class={cn("aspect-square size-full", className)}
  {...restProps}
/>
