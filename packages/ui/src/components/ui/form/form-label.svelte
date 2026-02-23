<script lang="ts">
import { Label } from "@transc/ui/label";
import { cn, type WithoutChild } from "@transc/ui/utils";
import type * as FormPrimitive from "formsnap";

const {
  ref = $bindable(null),
  children,
  class: className,
  ...restProps
}: WithoutChild<FormPrimitive.LabelProps> = $props();
</script>

<FormPrimitive.Label {...restProps} bind:ref>
  {#snippet child({ props })}
    <Label
      {...props}
      data-slot="form-label"
      class={cn("data-fs-error:text-destructive", className)}
    >
      {@render children?.()}
    </Label>
  {/snippet}
</FormPrimitive.Label>
