<script lang="ts">
import {
  HouseIcon,
  PlayIcon,
  SearchIcon,
  EllipsisIcon,
} from "@lucide/svelte";
import { Avatar, AvatarFallback, AvatarImage } from "@transc/ui/avatar";
import { Button } from "@transc/ui/button";
import {
  Item,
  ItemActions,
  ItemContent,
  ItemDescription,
  ItemMedia,
  ItemTitle,
} from "@transc/ui/item";
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
    <Item variant="outline" class="group-data-[collapsible=icon]:p-0 group-data-[collapsible=icon]:border-none group-data-[collapsible=icon]:pb-1 transition-all">
      <ItemMedia>
        <a href="/profile">
          <Avatar class="ring ring-primary aspect-square w-full">
            <AvatarImage src="https://files.catbox.moe/u40330.jpg" alt="@username" />
            <AvatarFallback>UN</AvatarFallback>
          </Avatar>
        </a>
      </ItemMedia>
      <ItemContent class="group-data-[collapsible=icon]:hidden">
        <a href="/profile">
          <ItemTitle class="hover:underline">@username</ItemTitle>
        </a>
        <ItemDescription class="text-xs">10k+ Elo</ItemDescription>
      </ItemContent>
      <ItemActions class="w-full group-data-[collapsible=icon]:hidden">
        <Button variant="outline" size="sm" class="cursor-pointer"><EllipsisIcon /></Button>
        <Button variant="outline" size="sm" class="grow cursor-pointer"><SearchIcon /></Button>
      </ItemActions>
    </Item>
  </SidebarFooter>
</Sidebar>
