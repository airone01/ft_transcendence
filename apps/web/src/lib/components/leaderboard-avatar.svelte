<script lang="ts">
import { Avatar, AvatarFallback } from "@transc/ui/avatar";
import { Spinner } from "@transc/ui/spinner";
import UserAvatar from "./user-avatar.svelte";

const { userPromise, fallbackText, class: className } = $props();
</script>

{#await userPromise}
  <Avatar class={className}>
    <AvatarFallback class="bg-muted">
      <Spinner />
    </AvatarFallback>
  </Avatar>
{:then user}
  <UserAvatar
    userId={user.id}
    username={user.username}
    avatarUrl={user.avatar}
    class="h-12 w-12 md:w-14 md:h-14 {className}"
  />
{:catch _e}
  <Avatar class={className}>
    <AvatarFallback class="font-bold text-muted-foreground">
      {fallbackText}
    </AvatarFallback>
  </Avatar>
{/await}
