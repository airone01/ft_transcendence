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

const { logoutForm }: { logoutForm: HTMLFormElement | undefined } = $props();

function getIsActive(href: string, exact?: boolean): boolean {
  const currentPath = page.url.pathname;
  if (exact) return currentPath === href;
  if (href === "/") return currentPath === "/";
  return currentPath === href || currentPath.startsWith(`${href}/`);
}
</script>

<Sidebar collapsible="icon">
  <SidebarHeader
    class="border-b flex flex-row gap-2 select-none p-2 items-center h-11"
  >
    <div class="h-full w-8 flex justify-center items-center shrink-0">
      <ChessPawnIcon class="h-full w-full aspect-square" />
    </div>
    <p
      class="font-bold font-sans group-data-[collapsible=icon]:hidden shrink overflow-clip min-w-0 max-w-full"
    >
      ft_transcendence
    </p>
  </SidebarHeader>
  <SidebarContent>
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
  </SidebarContent>
  <SidebarFooter
    class="p-0 flex flex-col *:border-t gap-0 group-data-[collapsible=icon]:border-t"
  >
    <div
      class="p-4 pt-1 group-data-[collapsible=icon]:hidden hover:bg-accent/10 transition-all"
    >
      <SidebarGroupLabel>Quick Play</SidebarGroupLabel>
      <div class="flex flex-col gap-2">
        <Button href="/play" class="overflow-clip">
          <ZapIcon />
          Matchmaking
        </Button>
        <Button
          href="/play/bot"
          variant="outline"
          class="overflow-clip group-hover:bg-accent/10 hover:bg-accent/30"
        >
          <BotIcon />
          Play vs AI
        </Button>
      </div>
    </div>
    <UserItem {logoutForm} />
  </SidebarFooter>
</Sidebar>
