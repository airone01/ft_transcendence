<script lang="ts">
  import { page } from "$app/state";
  import { cn } from "@transc/ui/utils";
  import { Button } from "@transc/ui/button";
  import type { Component } from "svelte";
  import { AudioLinesIcon, ContrastIcon, EarthLockIcon, Gamepad2Icon, KeyRoundIcon, UserIcon, type IconProps } from "@lucide/svelte";

  let { children } = $props();

  const sidebarNavItems: {icon: Component<IconProps, {}, "">, title: string, href: string}[]  = [
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
    <h2 class="text-2xl font-bold tracking-tight">Settings</h2>
    <p class="text-muted-foreground">
      Manage your account settings and preferences.
    </p>
  </header>
  <div id="hello" class="flex-1 min-h-0 flex flex-col lg:flex-row gap-4 p-4 border rounded-xl">
    <aside class="lg:max-w-xs border rounded-lg p-2 overflow-x-scroll overflow-y-clip lg:overflow-x-clip">
      <nav class="flex lg:flex-col gap-1">
        {#each sidebarNavItems as item}
          <Button
            href={item.href}
            variant="ghost"
            class={cn(
              "justify-start hover:bg-muted text-left",
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
    <div class="flex-1 border rounded-lg w-full p-4">
      {@render children?.()}
    </div>
  </div>
</main>
