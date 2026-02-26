<script lang="ts">
import { EllipsisIcon } from "@lucide/svelte";
import { Badge } from "@transc/ui/badge";
import { Button } from "@transc/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@transc/ui/dropdown-menu";
import { Tooltip, TooltipContent, TooltipTrigger } from "@transc/ui/tooltip";
import { page } from "$app/state";
import UserAvatar from "./user-avatar.svelte";

const { logoutForm }: { logoutForm: HTMLFormElement | undefined } = $props();

const user = $derived(page.data.user);
const stats = $derived(page.data.stats);
</script>

{#if user}
  <div
    class="group flex items-center gap-3 p-4 w-full hover:bg-accent/10 transition-all group-data-[state=collapsed]:p-2 group-data-[state=collapsed]:border-none"
  >
    <UserAvatar
      username={user.username}
      userId={user.id}
      avatarUrl={user.avatar}
      class="shrink-0"
      href="/profile/me"
    />
    <div
      class="flex flex-col justify-center shrink w-full min-w-0 h-full group-data-[state=collapsed]:hidden"
    >
      <Tooltip>
        <TooltipTrigger class="h-4 flex justify-center w-fit max-w-full">
          <a
            href="/profile/me"
            class="text-left hover:underline text-sm max-w-full w-fit truncate leading-none"
          >
            {user.username}
          </a>
        </TooltipTrigger>
        <TooltipContent>
          <p>{user.username}</p>
        </TooltipContent>
      </Tooltip>
      <Badge
        variant="outline"
        class="text-xs text-[0.6rem] py-px px-0.75 text-muted-foreground border-muted"
      >
        ELO {stats?.currentElo ?? '???'}
      </Badge>
    </div>
    <DropdownMenu>
      <DropdownMenuTrigger class="shrink-0 group-data-[state=collapsed]:hidden">
        <Button
          variant="outline"
          size="icon"
          class="cursor-pointer group-hover:bg-accent/10 hover:bg-accent/30 p-0"
        >
          <EllipsisIcon class="aspect-square" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent class="w-56" align="start">
        <DropdownMenuItem
          onclick={() => logoutForm?.requestSubmit()}
          class="cursor-pointer"
        >
          Log out
        </DropdownMenuItem>
        <a href="/settings/profile"
          ><DropdownMenuItem class="cursor-pointer">
            Settings
          </DropdownMenuItem></a
        >
      </DropdownMenuContent>
    </DropdownMenu>
  </div>
{/if}
