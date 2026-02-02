<script lang="ts">
import IconBolt from "virtual:icons/tabler/bolt";
import IconHome from "virtual:icons/tabler/home";
import IconInbox from "virtual:icons/tabler/inbox";
import IconPlay from "virtual:icons/tabler/play";
import IconSearch from "virtual:icons/tabler/search";
import IconSettings from "virtual:icons/tabler/settings";
import IconSwords from "virtual:icons/tabler/swords";
// import Icon from "virtual:icons/tabler/";
import * as Sidebar from "@transc/ui/components/ui/sidebar/index.ts";
import * as Item from "@transc/ui/components/ui/item/index.ts";
import * as Avatar from "@transc/ui/components/ui/avatar/index.ts";
import type { Component } from "svelte";
    import { Button } from "@transc/ui/components/ui/button/index.js";

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
        icon: IconHome,
      },
      {
        title: "Inbox",
        url: "/inbox",
        icon: IconInbox,
      },
    ],
  },
  {
    label: "Play Now",
    items: [
      {
        title: "Standard",
        url: "/play",
        icon: IconPlay,
      },
      {
        title: "Blitz",
        url: "/blitz",
        icon: IconBolt,
      },
      {
        title: "Competive",
        url: "/competitive",
        icon: IconSwords,
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
    <Item.Root variant="outline">
      <Item.Media>
        <a href="/profile">
          <Avatar.Root class="ring ring-primary aspect-square w-full">
            <Avatar.Image src="https://files.catbox.moe/u40330.jpg" alt="@username" />
            <Avatar.Fallback>UN</Avatar.Fallback>
          </Avatar.Root>
        </a>
      </Item.Media>
      <Item.Content>
        <a href="/profile">
          <Item.Title class="hover:underline">@username</Item.Title>
        </a>
        <Item.Description class="text-xs">10k+ Elo</Item.Description>
      </Item.Content>
      <Item.Actions class="w-full">
        <a href="/settings"><Button variant="outline" size="sm" class="cursor-pointer"><IconSettings /></Button></a>
        <Button variant="outline" size="sm" class="grow cursor-pointer"><IconSearch /></Button><!-- no <a/> because it's the Command component --->
      </Item.Actions>
    </Item.Root>
  </Sidebar.Footer>
</Sidebar.Root>
