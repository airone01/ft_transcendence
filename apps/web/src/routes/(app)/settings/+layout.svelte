<script lang="ts">
  import { page } from "$app/state";
  import { cn } from "@transc/ui/utils";
  import { Button } from "@transc/ui/button";

  let { children } = $props();

  const sidebarNavItems = [
    { title: "Profile", href: "/settings/profile" },
    { title: "Gameplay", href: "/settings/gameplay" },
    { title: "Sound", href: "/settings/sound" },
    { title: "Display", href: "/settings/display" },
    { title: "Privacy", href: "/settings/privacy" },
  ];
</script>

<main class="hidden space-y-6 pb-16 md:block w-full h-full">
  <div class="space-y-0.5 grow-0">
    <h2 class="text-2xl font-bold tracking-tight">Settings</h2>
    <p class="text-muted-foreground">
      Manage your account settings and preferences.
    </p>
  </div>
  <div class="flex flex-col space-y-8 lg:flex-row lg:space-x-12 lg:space-y-0 gap-4 m-4 p-4 border rounded-md grow h-full">
    <aside class="lg:w-1/5 border rounded-md p-2 mr-0">
      <nav class="flex space-x-2 lg:flex-col lg:space-x-0 lg:space-y-1">
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
            {item.title}
          </Button>
        {/each}
      </nav>
    </aside>
    <div class="flex-1 border rounded-md w-full grow p-4">
      {@render children?.()}
    </div>
  </div>
</main>
