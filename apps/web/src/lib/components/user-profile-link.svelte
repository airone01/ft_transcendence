<script lang="ts">
import { CalendarIcon, ChartSplineIcon } from "@lucide/svelte";
import { Avatar, AvatarFallback, AvatarImage } from "@transc/ui/avatar";
import {
  HoverCard,
  HoverCardContent,
  HoverCardTrigger,
} from "@transc/ui/hover-card";
import type { Snippet } from "svelte";
import * as m from "$lib/paraglide/messages";
import { getLocale } from "$lib/paraglide/runtime";

let {
  userId,
  fallbackUsername = "Unknown",
  children,
  class: className = "",
  href,
} = $props<{
  userId: number | string;
  fallbackUsername?: string;
  children: Snippet;
  class?: string;
  href?: string;
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
    href={href ?? `/profile/${userId}`}
    class="inline-flex items-center {className}"
  >
    {@render children()}
  </HoverCardTrigger>

  <HoverCardContent class="w-80">
    {#await userPromise}
      <div class="flex items-center space-x-4">
        <Avatar>
          <AvatarImage src={`/api/users/${userId}/avatar`} />
          <AvatarFallback>
            {fallbackUsername.substring(0, 2).toUpperCase()}
          </AvatarFallback>
        </Avatar>
        <div class="space-y-1">
          <h4 class="text-sm font-semibold">@{fallbackUsername}</h4>
          <p class="text-xs text-muted-foreground animate-pulse">
            {m.user_profile_link_loading()}
          </p>
        </div>
      </div>
    {:then fullUser}
      <div class="flex space-x-4 items-start">
        <Avatar class="border">
          <AvatarImage src={`/api/users/${fullUser.id}/avatar`} />
          <AvatarFallback>
            {fullUser.username.substring(0, 2).toUpperCase()}
          </AvatarFallback>
        </Avatar>
        <div class="space-y-1 flex flex-col">
          <h4 class="text-sm font-semibold">@{fullUser.username}</h4>
          <p class="text-sm mt-1">
            {fullUser.bio || m.user_profile_link_bio_empty()}
          </p>
          <div class="text-xs text-muted-foreground"></div>
          <div class="flex items-center text-xs text-muted-foreground gap-2">
            {#if fullUser.currentElo}
              <ChartSplineIcon class="w-3 h-3" />
              <span>ELO {fullUser.currentElo}</span>
            {/if}
            <CalendarIcon class="w-3 h-3" />
            <span class="capitalize"
              >{m.user_profile_link_joined({date: new Date(fullUser.createdAt).toLocaleDateString(getLocale())})}</span
            >
          </div>
        </div>
      </div>
    {:catch _e}
      <p class="text-sm text-destructive">{m.user_profile_link_fail()}</p>
    {/await}
  </HoverCardContent>
</HoverCard>
