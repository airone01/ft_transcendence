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
    <span class="sr-only">Toggle theme</span>
  </DropdownMenuTrigger>
  <DropdownMenuContent align="end">
    <DropdownMenuItem onclick={() => setMode("light")}>Light</DropdownMenuItem>
    <DropdownMenuItem onclick={() => setMode("dark")}>Dark</DropdownMenuItem>
    <DropdownMenuItem onclick={() => resetMode()}>System</DropdownMenuItem>
  </DropdownMenuContent>
</DropdownMenu>
