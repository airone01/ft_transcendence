<script lang="ts">
import { GlobeIcon } from "@lucide/svelte";
import { Button } from "@transc/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@transc/ui/dropdown-menu";

import {
  getLocale,
  locales,
  setLocale,
} from "$lib/paraglide/runtime";

const languageNames: Record<string, string> = {
  en: "English",
  fr: "Français",
  es: "Español",
};
</script>

<DropdownMenu>
  <DropdownMenuTrigger>
    <Button variant="outline" size="sm" class="gap-2">
      <GlobeIcon class="w-4 h-4" />
      <span class="hidden sm:inline-block">
        {languageNames[getLocale()] ?? getLocale().toUpperCase()}
      </span>
    </Button>
  </DropdownMenuTrigger>

  <DropdownMenuContent align="end" class="w-40">
    {#each locales as lang}
      <DropdownMenuItem
        class={lang === getLocale() ? "font-medium" : "cursor-pointer"}
        onclick={() => setLocale(lang)}
        data-sveltekit-reload
      >
        {languageNames[lang] ?? lang.toUpperCase()}
      </DropdownMenuItem>
    {/each}
  </DropdownMenuContent>
</DropdownMenu>
