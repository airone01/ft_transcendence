<script lang="ts">
import { EllipsisIcon, SearchIcon, LogOutIcon } from "@lucide/svelte";
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
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
} from "@transc/ui/dropdown-menu"
import { enhance } from "$app/forms";
import { invalidateAll } from "$app/navigation";
import { toast } from "svelte-sonner";

let logoutForm: HTMLFormElement;
</script>

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
    <DropdownMenu>
      <DropdownMenuTrigger>
        <Button variant="outline" size="sm" class="cursor-pointer"><EllipsisIcon /></Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent class="w-56" align="start">
        <form 
          action="/logout" 
          method="POST" 
          bind:this={logoutForm}
          use:enhance={() => {
            return async ({ result }) => {
              if (result.type === 'redirect' || result.type === 'success') {
                toast.success("You logged out. See you soon!");
                await invalidateAll(); // invalidates data to redraw interface
              } else {
                toast.error("Failed to log out");
              }
            };
          }}
        >
          <DropdownMenuItem type="submit" onclick={() => logoutForm.requestSubmit()}>Log out</DropdownMenuItem>
        </form>
      </DropdownMenuContent>
    </DropdownMenu>
    <Button variant="outline" size="sm" class="grow cursor-pointer"><SearchIcon /></Button>
  </ItemActions>
</Item>

