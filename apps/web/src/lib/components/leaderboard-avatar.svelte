<script lang="ts">
import { Avatar, AvatarFallback } from "@transc/ui/avatar";
import { Badge } from "@transc/ui/badge";
import { Spinner } from "@transc/ui/spinner";
import type { User } from "$lib/server/db-services";
import UserAvatar from "./user-avatar.svelte";
import UserProfileLink from "./user-profile-link.svelte";

const {
  userPromise,
  fallbackText,
  class: className,
  currentElo,
  i,
}: {
  userPromise: Promise<User>;
  fallbackText: string;
  class: string;
  currentElo: number;
  i?: number;
} = $props();
</script>

{#await userPromise}
  <Avatar class="{className} h-14 w-14">
    <AvatarFallback class="bg-muted">
      <Spinner />
    </AvatarFallback>
  </Avatar>
{:then user}
  {#if i !== undefined && i < 3}
    {@const isFirst = i === 0}
    {@const isSecond = i === 1}
    <UserProfileLink
      userId={user.id}
      fallbackUsername={user.username}
      class="gap-2 flex-col"
    >
      <UserAvatar
        userId={user.id}
        avatarUrl={user.avatar}
        username={user.username}
        class="h-14 w-14 border-4 {isFirst ? 'border-yellow-400' : isSecond ? 'border-slate-300' : 'border-amber-600'}"
      />
      <span class="font-bold">{user.username}</span>
      <Badge variant="default">{currentElo}</Badge>
    </UserProfileLink>
  {:else}
    <UserProfileLink
      userId={user.id}
      fallbackUsername={user.username}
      class="gap-2"
    >
      <UserAvatar
        username={user.username}
        userId={user.id}
        avatarUrl={user.avatar}
        class="h-12 w-12"
      />
      <div class="flex flex-col">
        <span class="font-bold">{user.username}</span>
        <Badge variant="default">{currentElo}</Badge>
      </div>
    </UserProfileLink>
  {/if}
{:catch _e}
  <Avatar class={className}>
    <AvatarFallback class="font-bold text-muted-foreground">
      {fallbackText}
    </AvatarFallback>
  </Avatar>
{/await}
