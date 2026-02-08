<script lang="ts">
import {
  Button,
  type ButtonProps,
} from "@transc/ui/components/ui/button/index.js";

const { ref = $bindable(null), ...restProps }: ButtonProps = $props();
</script>

<Button bind:ref type="submit" {...restProps} />
