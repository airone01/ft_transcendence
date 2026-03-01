<script lang="ts">
import { Avatar, AvatarFallback, AvatarImage } from "@transc/ui/avatar";
import {
  HoverCard,
  HoverCardContent,
  HoverCardTrigger,
} from "@transc/ui/hover-card";
import type { Snippet } from "svelte";
import { onlineUsersStore } from "$lib/stores/presence.store";

let {
  userId,
  username = "Unknown",
  avatarUrl,
  children,
  class: className = "",
  showUsername = false,
  hasHoverCard = true,
  href,
} = $props<{
  userId: string | number;
  username?: string;
  avatarUrl?: string | null;
  children?: Snippet<
    [
      {
        status: string;
        user: {
          id: string | number;
          username: string;
          avatarUrl: string;
          initials: string;
        };
      },
    ]
  >;
  showUsername?: boolean;
  hasHoverCard?: boolean;
  href?: string | null;
  class?: string;
  avatarClass?: string;
}>();

let status = $derived($onlineUsersStore.get(String(userId)) ?? "offline");
let resolvedAvatar = $derived(avatarUrl);
let initials = $derived(username.substring(0, 2).toUpperCase());

// package data for headless mode
let userData = $derived({
  id: userId,
  username,
  avatarUrl: resolvedAvatar,
  initials,
});

let statusColorClass = $derived(
  status === "online"
    ? "bg-green-500"
    : status === "ingame"
      ? "bg-purple-500"
      : "bg-muted-foreground",
);

// svelte-ignore state_referenced_locally: idc
if (href === undefined) href = `/profile/${userId}`;
</script>

{#snippet avatarContent()}
  {#if !showUsername}
    <div class="relative inline-flex shrink-0 align-middle">
      <Avatar class="h-10 w-10 border {className}">
        <AvatarImage src={userData.avatarUrl} alt={userData.username} />
        <AvatarFallback>{userData.initials}</AvatarFallback>
      </Avatar>
      <span
        class="absolute bottom-0 right-0 h-3.5 w-3.5 rounded-full border-2 border-background {statusColorClass}"
        title={status}
      ></span>
    </div>
  {:else}
    <div class="inline-flex items-center gap-3">
      <div class="relative inline-flex shrink-0">
        <Avatar class="h-10 w-10 border {className}">
          <AvatarImage src={userData.avatarUrl} alt={userData.username} />
          <AvatarFallback>{userData.initials}</AvatarFallback>
        </Avatar>

        <span
          class="absolute bottom-0 right-0 h-3.5 w-3.5 rounded-full border-2 border-background {statusColorClass}"
          title={status}
        ></span>
      </div>

      <span class="text-sm font-medium leading-none">{userData.username}</span>
    </div>
  {/if}
{/snippet}

{#if children}
  {@render children({ status, user: userData })}
{:else}
  {#if hasHoverCard}
    <HoverCard>
      <HoverCardTrigger {href}>{@render avatarContent()}</HoverCardTrigger>
      <HoverCardContent class="w-80">
        <div class="flex space-x-4 items-center">
          <Avatar class="border">
            <AvatarImage src={userData.avatarUrl} />
            <AvatarFallback>{userData.initials}</AvatarFallback>
          </Avatar>
          <div class="space-y-1 flex flex-col">
            <h4 class="text-sm font-semibold">@{userData.username}</h4>
            <!-- <p class="text-sm"></p> -->
            <!-- <div class="flex items-center pt-2"> -->
            <!--   <CalendarDaysIcon class="me-2 size-4 opacity-70" /> -->
            <!--   <span class="text-muted-foreground text-xs"> -->
            <!--     Joined September 2022 -->
            <!--   </span> -->
            <!-- </div> -->
          </div>
        </div>
      </HoverCardContent>
    </HoverCard>
  {:else}
    {#if href}
      <a {href}> {@render avatarContent()} </a>
    {:else}
      {@render avatarContent()}
    {/if}
  {/if}
{/if}
