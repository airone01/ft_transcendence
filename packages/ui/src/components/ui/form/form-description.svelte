<script lang="ts">
import { cn, type WithoutChild } from "@transc/ui/utils";
import type * as FormPrimitive from "formsnap";

const {
  ref = $bindable(null),
  class: className,
  ...restProps
}: WithoutChild<FormPrimitive.DescriptionProps> = $props();
</script>

<FormPrimitive.Description
	bind:ref
	data-slot="form-description"
	class={cn("text-muted-foreground text-sm", className)}
	{...restProps}
/>
