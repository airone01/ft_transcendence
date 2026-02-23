<script lang="ts">
import type { DropdownMenu as DropdownMenuPrimitive } from "bits-ui";

const {
  open = $bindable(false),
  ...restProps
}: DropdownMenuPrimitive.RootProps = $props();
</script>

<DropdownMenuPrimitive.Root bind:open {...restProps} />
