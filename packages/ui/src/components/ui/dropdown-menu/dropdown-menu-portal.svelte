<script lang="ts">
import type { DropdownMenu as DropdownMenuPrimitive } from "bits-ui";

const { ...restProps }: DropdownMenuPrimitive.PortalProps = $props();
</script>

<DropdownMenuPrimitive.Portal {...restProps} />
