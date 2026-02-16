<script lang="ts">
import { page } from "$app/state";
import {
    BotIcon,
  ChessPawnIcon,
  HandshakeIcon,
  HouseIcon,
  TrophyIcon,
  UserIcon,
  ZapIcon,
} from "@lucide/svelte";
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
import UserItem from "$lib/components/app-sidebar-user-item.svelte";
import type { Component } from "svelte";
import { Button } from "@transc/ui/button";

type GroupItem = {
  title: string;
  url: string;
  icon: Component;
  exact?: boolean;
};
type Group = {
  label: string;
  items: GroupItem[];
};

const groups: Group[] = [
  {
    label: "My Content",
    items: [
      {
        title: "Home",
        url: "/",
        icon: HouseIcon,
      },
      {
        title: "My Profile",
        url: "/profile/me",
        icon: UserIcon,
        exact: true,
      },
      {
        title: "Friends",
        url: "/profile/me/friends",
        icon: HandshakeIcon,
      }
    ],
  },
  {
    label: "Chess",
    items: [
      {
        title: "Play Now",
        url: "/play",
        icon: ZapIcon,
      },
      {
        title: "Ranking",
        url: "/ranking",
        icon: TrophyIcon,
      },
    ],
  },
];

function getIsActive(item: GroupItem): boolean {
  const currentPath = page.url.pathname;
  if (item.exact)
    return currentPath === item.url;
  if (item.url === "/")
    return currentPath === "/";
  return currentPath === item.url || currentPath.startsWith(item.url + "/");
}
</script>
 
<Sidebar collapsible="icon">
  <SidebarHeader class="border-b flex flex-row gap-2 select-none p-2 items-center h-11">
    <div class="h-full w-8 flex justify-center items-center shrink-0">
      <ChessPawnIcon class="h-full w-full aspect-square" />
    </div>
    <p class="font-bold font-sans group-data-[collapsible=icon]:hidden shrink overflow-clip min-w-0 max-w-full">
      ft_transcendence
    </p>
  </SidebarHeader>
  <SidebarContent>
    {#each groups as group}
      <SidebarGroup>
        <SidebarGroupLabel>{group.label}</SidebarGroupLabel>
        <SidebarGroupContent>
          <SidebarMenu>
            {#each group.items as item (item.title)}
              <SidebarMenuItem>
                <SidebarMenuButton isActive={getIsActive(item)} class="transition-colors">
                  {#snippet child({ props }: {props: Record<string, unknown>})}
                    <a href={item.url} {...props}>
                      <item.icon />
                      <span>{item.title}</span>
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
  <SidebarFooter class="p-0 flex flex-col *:border-t gap-0 group-data-[collapsible=icon]:border-t">
    <div class="p-4 pt-1 group-data-[collapsible=icon]:hidden hover:bg-accent/10 transition-all">
      <SidebarGroupLabel>Quick Play</SidebarGroupLabel>
      <div class="flex flex-col gap-2">
        <Button href="/play" class="overflow-clip"><ZapIcon/>Matchmaking</Button>
        <Button href="/play/bot" variant="outline" class="overflow-clip group-hover:bg-accent/10 hover:bg-accent/30"><BotIcon/>Play vs AI</Button>
      </div>
    </div>
    <UserItem />
  </SidebarFooter>
</Sidebar>
