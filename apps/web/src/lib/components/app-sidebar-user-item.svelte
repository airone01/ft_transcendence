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
import { page } from "$app/state";
import * as m from "$lib/paraglide/messages.js";
import UserAvatar from "./user-avatar.svelte";
import UserProfileLink from "./user-profile-link.svelte";

const { logoutForm }: { logoutForm: HTMLFormElement | undefined } = $props();

const user = $derived(page.data.user);
const stats = $derived(page.data.stats);
</script>

{#if user}
  <div
    class="flex items-center gap-3 p-4 w-full transition-all group-data-[state=collapsed]:p-2 group-data-[state=collapsed]:border-none"
  >
    <UserProfileLink
      userId={user.id}
      fallbackUsername={user.username}
      class="gap-3 w-full"
    >
      <UserAvatar
        userId={user.id}
        avatarUrl={user.avatar}
        username={user.username}
        class="h-10 w-10 group-data-[collapsible=icon]:h-8 group-data-[collapsible=icon]:w-8"
      />
      <div class="flex flex-col group-data-[collapsible=icon]:hidden">
        <span class="text-sm font-medium">{user.username}</span>
        <Badge class="text-xs text-[0.6rem] py-px px-0.75">
          ELO {stats?.currentElo ?? '???'}
        </Badge>
      </div>
    </UserProfileLink>
    <DropdownMenu>
      <DropdownMenuTrigger class="shrink-0 group-data-[state=collapsed]:hidden">
        <Button
          variant="outline"
          size="icon"
          class="p-0"
        >
          <EllipsisIcon class="aspect-square" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent class="w-56" align="start">
        <DropdownMenuItem onclick={() => logoutForm?.requestSubmit()}>
          {m.app_sidebar_user_item_logout()}
        </DropdownMenuItem>
        <a href="/settings/profile"
          ><DropdownMenuItem>
            {m.app_sidebar_user_item_settings()}
          </DropdownMenuItem></a
        >
      </DropdownMenuContent>
    </DropdownMenu>
  </div>
{/if}
