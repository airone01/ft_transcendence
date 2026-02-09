<script lang="ts">
import { EllipsisIcon } from "@lucide/svelte";
import { Avatar, AvatarFallback, AvatarImage } from "@transc/ui/avatar";
import { Button } from "@transc/ui/button";
import { Tooltip, TooltipContent, TooltipTrigger } from "@transc/ui/tooltip";
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
} from "@transc/ui/dropdown-menu"
import { enhance } from "$app/forms";
import { invalidateAll } from "$app/navigation";
import { page } from "$app/state";
import { toast } from "svelte-sonner";

const user = $derived(page.data.user);
const initials = $derived(user?.username?.slice(0, 2).toUpperCase() || "??");
let logoutForm: HTMLFormElement | undefined = $state();

</script>

{#if user}
  <div class="flex p-4 gap-2 w-full">
    <a href="/profile" class="shrink-0">
      <Avatar class="ring ring-primary aspect-square w-full">
        <AvatarImage src={user.avatar} alt={user.username} />
        <AvatarFallback class="bg-linear-to-r from-blue-600 to-fuchsia-500 text-background">{initials}</AvatarFallback>
      </Avatar>
    </a>
    <div class="flex flex-col justify-center shrink w-full min-w-0 h-full">
      <Tooltip>
        <TooltipTrigger class="h-4 flex justify-center items-center">
          <a href="/profile" class="hover:underline text-sm w-full truncate leading-none -inset-y-1">
            {user.username}
          </a>
        </TooltipTrigger>
        <TooltipContent>
          <p>{user.username}</p>
        </TooltipContent>
      </Tooltip>
      <div class="text-xs w-full truncate leading-none text-muted-foreground">...more info</div>
    </div>
    <DropdownMenu>
      <DropdownMenuTrigger class="shrink-0">
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
          <DropdownMenuItem onclick={() => logoutForm?.requestSubmit()}>Log out</DropdownMenuItem>
        </form>
      </DropdownMenuContent>
    </DropdownMenu>
  </div>
{/if}

