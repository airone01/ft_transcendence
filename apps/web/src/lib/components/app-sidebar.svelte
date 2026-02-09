<script lang="ts">
import { page } from "$app/state";
import {
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

type GroupItem = {
  title: string;
  url: string;
  icon: Component;
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
                <SidebarMenuButton isActive={item.url === "/" ? page.url.pathname === "/" : page.url.pathname.startsWith(item.url)}>
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
  <SidebarFooter class="p-0 border-t">
    <UserItem />
  </SidebarFooter>
</Sidebar>
