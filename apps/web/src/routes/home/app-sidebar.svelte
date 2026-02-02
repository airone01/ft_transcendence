<script lang="ts">
import IconCalendar from "virtual:icons/tabler/calendar";
import IconHome from "virtual:icons/tabler/home";
import IconInbox from "virtual:icons/tabler/inbox";
import IconSearch from "virtual:icons/tabler/search";
import IconSettings from "virtual:icons/tabler/settings";
import * as Sidebar from "@transc/ui/components/ui/sidebar/index.ts";

// Menu items.
const items = [
  {
    title: "Home",
    url: "#",
    icon: IconHome,
  },
  {
    title: "Inbox",
    url: "#",
    icon: IconInbox,
  },
  {
    title: "Calendar",
    url: "#",
    icon: IconCalendar,
  },
  {
    title: "Search",
    url: "#",
    icon: IconSearch,
  },
  {
    title: "Settings",
    url: "#",
    icon: IconSettings,
  },
];
</script>
 
<Sidebar.Root>
 <Sidebar.Content>
  <Sidebar.Group>
   <Sidebar.GroupLabel>Application</Sidebar.GroupLabel>
   <Sidebar.GroupContent>
    <Sidebar.Menu>
     {#each items as item (item.title)}
      <Sidebar.MenuItem>
       <Sidebar.MenuButton>
        {#snippet child({ props })}
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
 </Sidebar.Content>
</Sidebar.Root>
