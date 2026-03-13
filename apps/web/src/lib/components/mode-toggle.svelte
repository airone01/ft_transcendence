<script lang="ts">
import MoonIcon from "@lucide/svelte/icons/moon";
import SunIcon from "@lucide/svelte/icons/sun";
import { buttonVariants } from "@transc/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@transc/ui/dropdown-menu";
import { cn } from "@transc/ui/utils";
import { resetMode, setMode } from "mode-watcher";
import { m } from "$lib/paraglide/messages";
</script>

<DropdownMenu>
  <DropdownMenuTrigger
    class={cn(buttonVariants({ variant: "outline", size: "icon" }), 'h-8 w-8')}
  >
    <SunIcon
      class="h-[1.2rem] w-[1.2rem] scale-100 rotate-0 transition-all! dark:scale-0 dark:-rotate-90"
    />
    <MoonIcon
      class="absolute h-[1.2rem] w-[1.2rem] scale-0 rotate-90 transition-all! dark:scale-100 dark:rotate-0"
    />
    <span class="sr-only">{m.switch_language_span()}</span>
  </DropdownMenuTrigger>
  <DropdownMenuContent align="end">
    <DropdownMenuItem onclick={() => setMode("light")}>
      {m.switch_language_light()}
    </DropdownMenuItem>
    <DropdownMenuItem onclick={() => setMode("dark")}>
      {m.switch_language_dark()}
    </DropdownMenuItem>
    <DropdownMenuItem onclick={() => resetMode()}>
      {m.switch_language_system()}
    </DropdownMenuItem>
  </DropdownMenuContent>
</DropdownMenu>
