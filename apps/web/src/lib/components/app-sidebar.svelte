<script lang="ts">
import {
  HouseIcon,
  PlayIcon,
} from "@lucide/svelte";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
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
      }
    ],
  },
  {
    label: "Play Now",
    items: [
      {
        title: "Standard",
        url: "/play",
        icon: PlayIcon,
      },
    ],
  },
];
</script>
 
<Sidebar collapsible="icon">
  <SidebarContent>
    {#each groups as group}
      <SidebarGroup>
        <SidebarGroupLabel>{group.label}</SidebarGroupLabel>
        <SidebarGroupContent>
          <SidebarMenu>
            {#each group.items as item (item.title)}
              <SidebarMenuItem>
                <SidebarMenuButton>
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
  <SidebarFooter>
    <UserItem />
  </SidebarFooter>
</Sidebar>
