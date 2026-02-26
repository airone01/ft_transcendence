<script lang="ts">
import {
  FrownIcon,
  MessageSquareIcon,
  SearchIcon,
  SwordsIcon,
  UserMinusIcon,
  UserPlusIcon,
} from "@lucide/svelte";
import type { SubmitFunction } from "@sveltejs/kit";
import { Avatar, AvatarFallback, AvatarImage } from "@transc/ui/avatar";
import { Badge } from "@transc/ui/badge";
import { Button } from "@transc/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@transc/ui/card";
import {
  Empty,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
} from "@transc/ui/empty";
import { Input } from "@transc/ui/input";
import { untrack } from "svelte";
import { toast } from "svelte-sonner";
import { enhance } from "$app/forms";
import UserAvatar from "$lib/components/user-avatar.svelte";
import { onlineUsersStore } from "$lib/stores/presence.store";

const { data } = $props();
// svelte-ignore state_referenced_locally: idc
let suggestedUsers = $state(data.suggestedUsers);

// svelte-ignore state_referenced_locally: superForms does not accept functions such as `() => data`
let friends = $state(data.friends);

$effect(() => {
  /* merge server data with current known statuses to avoid flickering "offline" on reload
  but we need to use untrack to avoid circular deps
  see https://svelte.dev/docs/svelte/svelte#untrack */
  const serverFriends = data.friends;
  const serverSuggestedUsers = data.suggestedUsers;

  untrack(() => {
    suggestedUsers = serverSuggestedUsers.map((u) => {
      const existing = suggestedUsers.find((eu) => eu.userId === u.userId);
      return existing ? { ...u, status: existing.status } : u;
    });

    friends = serverFriends.map((f) => {
      const existing = friends.find((ef) => ef.userId === f.userId);
      return existing ? { ...f, status: existing.status } : f;
    });
  });
});

$effect(() => {
  const currentOnline = $onlineUsersStore;
  const serverFriends = data.friends;

  untrack(() => {
    friends = serverFriends.map((f) => {
      // check global store for rt status, fallback to offline
      const rtStatus = (currentOnline.get(String(f.userId)) ?? "offline") as
        | "online"
        | "offline"
        | "ingame";
      return { ...f, status: rtStatus || "offline" };
    });
  });
});

// FORM HANDLING

const formEnhance: SubmitFunction = () => {
  return async ({ result, update }) => {
    if (result.type === "failure")
      toast.error(result.data?.error ?? "An error occurred");
    else if (result.type === "success")
      toast.success(result.data?.message ?? "Success");
    await update();
  };
};
</script>

<main class="flex flex-col gap-6 mx-auto w-full h-full">
  <div class="flex flex-col gap-4 md:flex-row md:items-end justify-between">
    <div class="space-y-1">
      <h2 class="text-2xl font-bold tracking-tight">Social</h2>
      <p class="text-muted-foreground">
        Manage your friends list and see who is online.
      </p>
    </div>

    <form
      method="POST"
      action="?/add"
      use:enhance={formEnhance}
      class="flex w-full md:max-w-xs items-center gap-2"
    >
      <div class="relative w-full">
        <SearchIcon
          class="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground"
        />
        <Input
          type="text"
          name="username"
          placeholder="Add by username..."
          class="pl-9"
          autocomplete="off"
        />
      </div>
      <Button
        type="submit"
        size="icon"
        variant="secondary"
        class="cursor-pointer"
      >
        <UserPlusIcon class="h-4 w-4" />
        <span class="sr-only">Add</span>
      </Button>
    </form>
  </div>

  <section class="gap-4 lg:grid flex flex-col grid-rows-2 grid-cols-2 h-full">
    <!-- friend list -->
    {#if friends.length === 0}
      <Empty class="border-dashed border-2 border-muted-foreground">
        <EmptyHeader>
          <EmptyMedia variant="icon">
            <FrownIcon />
          </EmptyMedia>
          <EmptyTitle>No friends yet</EmptyTitle>
          <EmptyDescription>
            Search for a username above to start building your list.
          </EmptyDescription>
        </EmptyHeader>
      </Empty>
    {:else}
      <Card>
        <CardHeader>
          <CardTitle>Friends ({friends.length})</CardTitle>
          <CardDescription>All your friends are here!</CardDescription>
        </CardHeader>
        <CardContent class="overflow-y-scroll flex flex-col gap-2">
          {#each friends as friend (friend.userId)}
            <Card class="overflow-hidden py-0">
              <CardContent class="p-2 flex items-center gap-4">
                <div class="relative">
                  <a href="/profile/{friend.userId}">
                    <UserAvatar
                      class="h-12 w-12 border"
                      avatarUrl={friend.avatar}
                      username={friend.username}
                      userId={friend.userId}
                    />
                  </a>
                  <span class="absolute bottom-0 right-0 flex h-3.5 w-3.5">
                    {#if friend.status === 'online'}
                      <span
                        class="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"
                      ></span>
                      <span
                        class="relative inline-flex rounded-full h-3.5 w-3.5 bg-green-500 border-2 border-background"
                      ></span>
                    {:else if friend.status === 'ingame'}
                      <span
                        class="relative inline-flex rounded-full h-3.5 w-3.5 bg-orange-500 border-2 border-background"
                      ></span>
                    {:else}
                      <span
                        class="relative inline-flex rounded-full h-3.5 w-3.5 bg-neutral-400 border-2 border-background"
                      ></span>
                    {/if}
                  </span>
                </div>

                <div class="flex-1 min-w-0">
                  <a
                    href="/profile/{friend.userId}"
                    class="font-medium hover:underline truncate block"
                  >
                    {friend.username}
                  </a>
                  <div
                    class="text-xs text-muted-foreground flex items-center gap-2"
                  >
                    <Badge variant="secondary" class="h-4 min-w-4 text-xs">
                      ELO {friend.currentElo}
                    </Badge>
                    <span class="capitalize">{friend.status}</span>
                  </div>
                </div>

                <div class="flex items-center gap-1">
                  <Button
                    href="/chat/{friend.userId}"
                    variant="ghost"
                    size="icon"
                    class="h-8 w-8 hover:bg-muted hover:text-primary text-muted-foreground"
                  >
                    <MessageSquareIcon class="h-4 w-4" />
                    <span class="sr-only">Chat</span>
                  </Button>

                  <Button
                    href="/play/against/{friend.userId}"
                    variant="ghost"
                    class="h-8 w-8 hover:bg-muted hover:text-primary text-muted-foreground"
                  >
                    <SwordsIcon class="h-4 w-4" />
                    <span class="sr-only">Fight</span>
                  </Button>

                  <form
                    method="POST"
                    action="?/remove"
                    use:enhance={formEnhance}
                  >
                    <input type="hidden" name="friendId" value={friend.userId}>
                    <Button
                      type="submit"
                      variant="ghost"
                      size="icon"
                      class="h-8 w-8 text-muted-foreground hover:bg-muted hover:text-destructive cursor-pointer"
                    >
                      <UserMinusIcon class="h-4 w-4" />
                      <span class="sr-only">Remove</span>
                    </Button>
                  </form>
                </div>
              </CardContent>
            </Card>
          {/each}
        </CardContent>
      </Card>
    {/if}

    <Card class="flex flex-col min-h-0 border-primary/20">
      <CardHeader class="shrink-0 pb-3">
        <CardTitle>Friend Requests</CardTitle>
        <CardDescription>People who want to connect with you.</CardDescription>
      </CardHeader>
      <CardContent class="overflow-y-auto flex-1 flex flex-col gap-2">
        {#if data.invitations && data.invitations.length > 0}
          {#each data.invitations as invite (invite.userId)}
            <Card class="overflow-hidden py-0 shrink-0">
              <CardContent class="p-2 px-3 flex items-center gap-4">
                <UserAvatar
                  avatarUrl={invite.avatar}
                  username={invite.username}
                  userId={invite.userId}
                />

                <div class="flex-1 min-w-0">
                  <a
                    href="/profile/{invite.userId}"
                    class="font-medium hover:underline truncate block text-sm"
                  >
                    {invite.username}
                  </a>
                </div>

                {#if invite.type === 'received'}
                  <div class="flex items-center gap-1">
                    <form
                      method="POST"
                      action="?/accept"
                      use:enhance={formEnhance}
                    >
                      <input type="hidden" name="userId" value={invite.userId}>
                      <Button
                        type="submit"
                        variant="secondary"
                        size="sm"
                        class="h-8 cursor-pointer"
                      >
                        Accept
                      </Button>
                    </form>
                    <form
                      method="POST"
                      action="?/reject"
                      use:enhance={formEnhance}
                    >
                      <input type="hidden" name="userId" value={invite.userId}>
                      <Button
                        type="submit"
                        variant="ghost"
                        size="sm"
                        class="h-8 text-muted-foreground hover:bg-destructive cursor-pointer px-2"
                      >
                        Reject
                      </Button>
                    </form>
                  </div>
                {:else if invite.type === 'sent'}
                  <div class="flex items-center">
                    <CardDescription>
                      Awaiting friend request approval
                    </CardDescription>
                  </div>
                {/if}
              </CardContent>
            </Card>
          {/each}
        {:else}
          <div
            class="flex flex-col items-center justify-center py-8 h-full text-muted-foreground text-sm text-center"
          >
            <UserPlusIcon class="h-8 w-8 mb-3 opacity-50" />
            <p>No pending requests.</p>
          </div>
        {/if}
      </CardContent>
    </Card>

    {#if (suggestedUsers?.length ?? 0 > 0)}
      <Card class="col-span-2">
        <CardHeader>
          <CardTitle>Suggested Players</CardTitle>
          <CardDescription>Make some friends and some enemies</CardDescription>
        </CardHeader>
        <CardContent class="flex justify-start h-full gap-2 pb-6">
          {#each suggestedUsers as {userId, avatar, username, currentElo}}
            <Card class="overflow-hidden flex flex-col flex-1 min-h-0 max-w-sm">
              <CardContent class="px-4 py-4 flex gap-4 justify-start flex-1">
                <div class="flex gap-4 items-center h-fit w-full">
                  <UserAvatar
                    avatarUrl={avatar}
                    username={username}
                    userId={userId}
                    class="h-12 w-12"
                  />
                  <div class="flex-1 min-w-0">
                    <a
                      href="/profile/{userId}"
                      class="font-medium hover:underline truncate block"
                    >
                      {username}
                    </a>
                    <div class="text-xs text-muted-foreground mt-0.5">
                      <Badge variant="secondary" class="h-4 px-1.5 text-[10px]">
                        ELO {currentElo}
                      </Badge>
                    </div>
                  </div>
                </div>
              </CardContent>
              <CardFooter class="pt-0 pb-3 px-3">
                <form
                  method="POST"
                  action="?/add"
                  use:enhance={formEnhance}
                  class="w-full"
                >
                  <input type="hidden" name="username" value={username}>
                  <Button
                    type="submit"
                    variant="secondary"
                    class="w-full cursor-pointer bg-accent/50 hover:bg-primary hover:text-primary-foreground"
                  >
                    <UserPlusIcon class="w-4 h-4 mr-2" /> Request
                  </Button>
                </form>
              </CardFooter>
            </Card>
          {/each}
        </CardContent>
      </Card>
    {:else}
      <Empty class="border-dashed border-2 border-muted-foreground col-span-2">
        <EmptyHeader>
          <EmptyMedia variant="icon">
            <FrownIcon />
          </EmptyMedia>
          <EmptyTitle>No recommendations</EmptyTitle>
          <EmptyDescription>
            We will soon recommend users here!
          </EmptyDescription>
        </EmptyHeader>
      </Empty>
    {/if}
  </section>
</main>
