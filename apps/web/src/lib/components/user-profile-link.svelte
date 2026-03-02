<script lang="ts">
import { CalendarIcon } from "@lucide/svelte";
import { Avatar, AvatarFallback, AvatarImage } from "@transc/ui/avatar";
import { Badge } from "@transc/ui/badge";
import {
  HoverCard,
  HoverCardContent,
  HoverCardTrigger,
} from "@transc/ui/hover-card";
import type { Snippet } from "svelte";

let {
  userId,
  fallbackUsername = "Unknown",
  fallbackAvatar = null,
  children,
  class: className = "",
} = $props<{
  userId: number | string;
  fallbackUsername?: string;
  fallbackAvatar?: string | null;
  children: Snippet;
  class?: string;
}>();

let isOpen = $state(false);

// lazy, on hover
let userPromise = $derived(
  isOpen
    ? fetch(`/api/users/${userId}`).then((res) => res.json())
    : new Promise(() => {}), // pending promise until hovered
);
</script>

<HoverCard bind:open={isOpen}>
  <HoverCardTrigger
    href="/profile/{userId}"
    class="inline-flex items-center {className}"
  >
    {@render children()}
  </HoverCardTrigger>

  <HoverCardContent class="w-80">
    {#await userPromise}
      <div class="flex items-center space-x-4">
        <Avatar>
          <AvatarImage src={fallbackAvatar} />
          <AvatarFallback>
            {fallbackUsername.substring(0, 2).toUpperCase()}
          </AvatarFallback>
        </Avatar>
        <div class="space-y-1">
          <h4 class="text-sm font-semibold">@{fallbackUsername}</h4>
          <p class="text-xs text-muted-foreground animate-pulse">
            Loading info...
          </p>
        </div>
      </div>
    {:then fullUser}
      <div class="flex space-x-4 items-start">
        <Avatar class="border">
          <AvatarImage src={fullUser.avatar ?? fallbackAvatar} />
          <AvatarFallback>
            {fullUser.username.substring(0, 2).toUpperCase()}
          </AvatarFallback>
        </Avatar>
        <div class="space-y-1 flex flex-col">
          <h4 class="text-sm font-semibold">@{fullUser.username}</h4>
          <p class="text-sm mt-1">{fullUser.bio ?? "No bio provided."}</p>
          <div
            class="flex items-center pt-2 text-xs text-muted-foreground gap-2"
          >
            <CalendarIcon class="w-3 h-3" />
            <span
              >Joined {new Date(fullUser.createdAt).toLocaleDateString()}</span
            >
            {#if fullUser.currentElo}
              <Badge variant="secondary" class="text-[10px] ml-auto">
                ELO {fullUser.currentElo}
              </Badge>
            {/if}
          </div>
        </div>
      </div>
    {:catch _e}
      <p class="text-sm text-destructive">Failed to load user info.</p>
    {/await}
  </HoverCardContent>
</HoverCard>
