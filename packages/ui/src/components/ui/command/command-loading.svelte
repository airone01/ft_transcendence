<script lang="ts">
import type { Command as CommandPrimitive } from "bits-ui";

const { ref = $bindable(null), ...restProps }: CommandPrimitive.LoadingProps =
  $props();
</script>

<CommandPrimitive.Loading bind:ref {...restProps} />
