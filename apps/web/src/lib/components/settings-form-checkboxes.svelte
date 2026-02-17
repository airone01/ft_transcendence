<script lang="ts" generics="T extends AnyZodObject">
import type { AnyZodObject } from "zod/v3";
import type { Infer, FormPath, SuperForm } from "sveltekit-superforms";

import { FormField, FormLabel, FormControl, FormFieldErrors } from "@transc/ui/form";
import { Checkbox } from "@transc/ui/checkbox";

let { 
  form,
  action,
  fields,
  formId,
} = $props<{
  schema: T;
  action: string;
  form: SuperForm<Infer<T>>,
  formId: string,
  fields: [FormPath<Infer<T>>, string, string?][]; 
}>();

// svelte-ignore state_referenced_locally: idc
const { form: formData, enhance } = form;
</script>

<form 
  id={formId}
  method="POST"
  {action}
  use:enhance
  class="flex-1 flex flex-col gap-4 items-start"
>
  {#each fields as [name, label, description]}
    <FormField {form} {name}>
      <FormControl>
        {#snippet children({ props })}
          <FormLabel class="hover:bg-accent/10 flex items-start gap-3 rounded-lg border p-3 has-aria-checked:border-accent has-aria-checked:bg-accent/20 transition-all mb-0 max-w-md">
            
            <Checkbox
              {...props}
              class="data-[state=checked]:border-accent data-[state=checked]:bg-accent data-[state=checked]:text-primary-foreground rounded-sm"
              
              bind:checked={$formData[name] as boolean} 
            />
            
            <div class="grid gap-1.5 font-normal">
              <p class="text-sm leading-none font-normal">{label}</p>
              {#if description}
                <p class="text-muted-foreground text-sm">{description}</p>
              {/if}
            </div>
          </FormLabel>
        {/snippet}
      </FormControl>
      <FormFieldErrors />
    </FormField>
  {/each}
</form>
