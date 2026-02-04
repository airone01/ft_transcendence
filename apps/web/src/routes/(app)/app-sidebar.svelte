<script lang="ts">
import {
  BoltIcon,
  HouseIcon,
  InboxIcon,
  PlayIcon,
  SearchIcon,
  SettingsIcon,
  SwordsIcon,
} from "@lucide/svelte";
import * as Avatar from "@transc/ui/components/ui/avatar/index.ts";
import { Button } from "@transc/ui/components/ui/button/index.js";
import * as Item from "@transc/ui/components/ui/item/index.ts";
import * as Sidebar from "@transc/ui/components/ui/sidebar/index.ts";
import type { Component } from "svelte";

// Menu items.
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
        url: "/home",
        icon: HouseIcon,
      },
      {
        title: "Inbox",
        url: "/inbox",
        icon: InboxIcon,
      },
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
      {
        title: "Blitz",
        url: "/blitz",
        icon: BoltIcon,
      },
      {
        title: "Competive",
        url: "/competitive",
        icon: SwordsIcon,
      },
    ],
  },
];
</script>
 
<Sidebar.Root collapsible="icon">
  <Sidebar.Content>
    {#each groups as group}
      <Sidebar.Group>
        <Sidebar.GroupLabel>{group.label}</Sidebar.GroupLabel>
        <Sidebar.GroupContent>
          <Sidebar.Menu>
            {#each group.items as item (item.title)}
              <Sidebar.MenuItem>
                <Sidebar.MenuButton>
                  {#snippet child({ props }: {props: Record<string, unknown>})}
                    <a href={item.url} {...props}>
                      <item.icon />
                      <span>{item.title}</span>
                    </a>
                  {/snippet}
                </Sidebar.MenuButton>
              </Sidebar.MenuItem>
            {/each}
          </Sidebar.Menu>
        </Sidebar.GroupContent>
      </Sidebar.Group>
    {/each}
  </Sidebar.Content>
  <Sidebar.Footer>
    <Item.Root variant="outline" class="group-data-[collapsible=icon]:p-0 group-data-[collapsible=icon]:border-none group-data-[collapsible=icon]:pb-1 transition-all">
      <Item.Media>
        <a href="/profile">
          <Avatar.Root class="ring ring-primary aspect-square w-full">
            <Avatar.Image src="https://files.catbox.moe/u40330.jpg" alt="@username" />
            <Avatar.Fallback>UN</Avatar.Fallback>
          </Avatar.Root>
        </a>
      </Item.Media>
      <Item.Content class="group-data-[collapsible=icon]:hidden">
        <a href="/profile">
          <Item.Title class="hover:underline">@username</Item.Title>
        </a>
        <Item.Description class="text-xs">10k+ Elo</Item.Description>
      </Item.Content>
      <Item.Actions class="w-full group-data-[collapsible=icon]:hidden">
        <a href="/settings"><Button variant="outline" size="sm" class="cursor-pointer"><SettingsIcon /></Button></a>
        <Button variant="outline" size="sm" class="grow cursor-pointer"><SearchIcon /></Button>
      </Item.Actions>
    </Item.Root>
  </Sidebar.Footer>
</Sidebar.Root>
