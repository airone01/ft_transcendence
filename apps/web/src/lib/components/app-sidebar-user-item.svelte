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
import { page } from "$app/state";

const { logoutForm }: { logoutForm: HTMLFormElement | undefined } = $props();

const user = $derived(page.data.user);
const initials = $derived(user?.username?.slice(0, 2).toUpperCase() ?? "??");
</script>

{#if user}
  <div class="group flex items-center gap-3 p-4 w-full hover:bg-accent/10 transition-all group-data-[state=collapsed]:p-2 group-data-[state=collapsed]:border-none">
    <a href="/profile/me" class="shrink-0">
      <Avatar class="ring ring-primary aspect-square w-full group-data-[state=collapsed]:w-full">
        <AvatarImage src={user.avatar} alt={user.username} />
        <AvatarFallback class="bg-linear-to-r from-blue-600 to-fuchsia-500 text-background">{initials}</AvatarFallback>
      </Avatar>
    </a>
    <div class="flex flex-col justify-center shrink w-full min-w-0 h-full group-data-[state=collapsed]:hidden">
      <Tooltip>
        <TooltipTrigger class="h-4 flex justify-center w-fit max-w-full">
          <a href="/profile/me" class="text-left hover:underline text-sm max-w-full w-fit truncate leading-none">
            {user.username}
          </a>
        </TooltipTrigger>
        <TooltipContent>
          <p>{user.username}</p>
        </TooltipContent>
      </Tooltip>
      <span class="font-mono bg-muted px-1 rounded-sm text-[10px] font-bold w-fit">
        ELO ????
      </span>
    </div>
    <DropdownMenu>
      <DropdownMenuTrigger class="shrink-0 group-data-[state=collapsed]:hidden">
        <Button variant="outline" size="sm" class="cursor-pointer group-hover:bg-accent/10 hover:bg-accent/30"><EllipsisIcon /></Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent class="w-56" align="start">
        <DropdownMenuItem onclick={() => logoutForm?.requestSubmit()} class="cursor-pointer">Log out</DropdownMenuItem>
        <DropdownMenuItem><a href="/settings/profile">Settings</a></DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  </div>
{/if}

