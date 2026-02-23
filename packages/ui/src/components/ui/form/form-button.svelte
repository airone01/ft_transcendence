<script lang="ts">
import { Button, type ButtonProps } from "@transc/ui/button";

const { ref = $bindable(null), ...restProps }: ButtonProps = $props();
</script>

<Button bind:ref type="submit" {...restProps} />
