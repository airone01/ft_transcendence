<script lang="ts">
import { BotIcon, ChessPawnIcon, ZapIcon } from "@lucide/svelte";
import { Button } from "@transc/ui/button";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@transc/ui/sidebar";
import { page } from "$app/state";
import UserItem from "$lib/components/app-sidebar-user-item.svelte";
import { sidebarGroups } from "$lib/navigation";
import * as m from "$lib/paraglide/messages.js";

const {
  logoutForm,
  collapsible = "icon",
}: {
  logoutForm: HTMLFormElement | undefined;
  collapsible?: "icon" | "offcanvas" | "none";
} = $props();

function getIsActive(href: string, exact?: boolean): boolean {
  const currentPath = page.url.pathname;
  if (exact) return currentPath === href;
  if (href === "/") return currentPath === "/";
  return currentPath === href || currentPath.startsWith(`${href}/`);
}
</script>

<Sidebar {collapsible}>
  <a href="/">
    <SidebarHeader class="border-b h-11 p-0">
      <section
        aria-label="Website logo"
        class="flex flex-row gap-2 select-none p-2 items-center h-11"
      >
        <div class="h-full w-8 flex justify-center items-center shrink-0">
          <ChessPawnIcon class="h-full w-full aspect-square" />
        </div>
        <p
          class="font-bold font-sans group-data-[collapsible=icon]:hidden shrink overflow-clip min-w-0 max-w-full"
        >
          {m.project_name()}
        </p>
      </section>
    </SidebarHeader>
  </a>
  <SidebarContent>
    <nav aria-label="Sidebar Elements">
      {#each sidebarGroups as {label: groupLabel, items} (groupLabel)}
        <SidebarGroup>
          <SidebarGroupLabel>{groupLabel}</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {#each items as {label: itemLabel, href, exact, ...i} (itemLabel)}
                <SidebarMenuItem>
                  <SidebarMenuButton
                    isActive={getIsActive(href, exact)}
                    class="transition-colors"
                  >
                    {#snippet child({ props }: {props: Record<string, unknown>})}
                      <a {href} {...props}>
                        <i.icon />
                        <span>{itemLabel}</span>
                      </a>
                    {/snippet}
                  </SidebarMenuButton>
                </SidebarMenuItem>
              {/each}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      {/each}
    </nav>
  </SidebarContent>
  <SidebarFooter
    class="p-0 flex flex-col *:border-t gap-0 group-data-[collapsible=icon]:border-t"
  >
    <nav
      aria-label="Sidebar navigation"
      class="p-4 pt-1 group-data-[collapsible=icon]:hidden transition-all"
    >
      <SidebarGroupLabel>{m.app_sidebar_group_label()}</SidebarGroupLabel>
      <div class="flex flex-col gap-2">
        <Button href="/play" class="overflow-clip">
          <ZapIcon />
          {m.app_sidebar_group_button_play()}
        </Button>
        <Button href="/play/bot" variant="outline">
          <BotIcon />
          {m.app_sidebar_group_button_bot()}
        </Button>
      </div>
    </nav>
    <UserItem {logoutForm} />
  </SidebarFooter>
</Sidebar>
