<script lang="ts">
import {
  AudioLinesIcon,
  ContrastIcon,
  EarthLockIcon,
  Gamepad2Icon,
  type IconProps,
  KeyRoundIcon,
  UserIcon,
} from "@lucide/svelte";
import { Button } from "@transc/ui/button";
import { cn } from "@transc/ui/utils";
import type { Component } from "svelte";
import { goto } from "$app/navigation";
import { page } from "$app/state";
import * as m from "$lib/paraglide/messages";
import { useMediaQuery } from "$lib/utils/media-query.svelte";

const { children } = $props();

const isMobile = useMediaQuery("(max-width: 1023px)");

const sidebarNavItems: {
  icon: Component<IconProps, Record<string, unknown>, "">;
  title: string;
  href: string;
}[] = [
  { icon: UserIcon, title: "Profile", href: "/settings/profile" },
  { icon: Gamepad2Icon, title: "Gameplay", href: "/settings/gameplay" },
  { icon: AudioLinesIcon, title: "Sound", href: "/settings/sound" },
  { icon: ContrastIcon, title: "Display", href: "/settings/display" },
  { icon: EarthLockIcon, title: "Privacy", href: "/settings/privacy" },
  { icon: KeyRoundIcon, title: "Account", href: "/settings/account" },
];
</script>

<main class="flex flex-col gap-4 pb-16 w-full h-full">
  <header>
    <h2 class="text-2xl font-bold tracking-tight">{m.settings_page_title()}</h2>
    <p class="text-muted-foreground">{m.settings_page_description()}</p>
  </header>
  <div class="flex-1 min-h-0 flex flex-col lg:flex-row gap-4">
    {#if isMobile.current}
      <select
        class="w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
        value={page.url.pathname}
        onchange={(e) => goto(e.currentTarget.value)}
      >
        {#each sidebarNavItems as item}
          <option value={item.href}>{item.title}</option>
        {/each}
      </select>
    {:else}
      <aside class="lg:max-w-xs border rounded-lg p-2 shrink-0">
        <nav class="flex flex-col gap-1">
          {#each sidebarNavItems as item}
            <Button
              href={item.href}
              variant="ghost"
              class={cn(
                "justify-start hover:bg-muted hover:text-current text-left",
                page.url.pathname === item.href
                  ? "bg-muted hover:bg-muted"
                  : "hover:underline",
              )}
            >
              <item.icon class="mr-1" />
              {item.title}
            </Button>
          {/each}
        </nav>
      </aside>
    {/if}
    <div class="flex-1 border rounded-lg w-full p-4 min-h-0">
      {@render children?.()}
    </div>
  </div>
</main>
