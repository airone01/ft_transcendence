<script lang="ts">
import { enhance } from "$app/forms";
import { Avatar, AvatarFallback, AvatarImage } from "@transc/ui/avatar";
import { Button } from "@transc/ui/button";
import { Input } from "@transc/ui/input";
import { Card, CardHeader, CardContent, CardDescription, CardFooter, CardTitle } from "@transc/ui/card";
import { Empty, EmptyDescription, EmptyHeader, EmptyMedia, EmptyTitle } from "@transc/ui/empty"
import { UserMinusIcon, UserPlusIcon, SearchIcon, MessageSquareIcon, FrownIcon, SwordsIcon } from "@lucide/svelte";
import { Badge } from "@transc/ui/badge";
import { toast } from "svelte-sonner";
import { socketManager } from "$lib/stores/socket.svelte";
import { onDestroy, onMount } from "svelte";
import { untrack } from "svelte";

let { data } = $props();

// svelte-ignore state_referenced_locally: superForms does not accept functions such as `() => data`
let friends = $state(data.friends);

$effect(() => {
  /* merge server data with current known statuses to avoid flickering "offline" on reload
  but we need to use untrack to avoid circular deps
  see https://svelte.dev/docs/svelte/svelte#untrack */
  const serverFriends = data.friends;
  untrack(() => {
    friends = serverFriends.map(f => {
      const existing = friends.find(ef => ef.userId === f.userId);
      return existing ? { ...f, status: existing.status } : f;
    });
  });
});

// RT STATUS LOGIC

function updateFriendStatus(userId: string | number, status: "online" | "offline" | "ingame") {
  const id = Number(userId);
  const index = friends.findIndex(f => f.userId === id);
  if (index !== -1) {
    friends[index].status = status;
  }
}

const onPresenceList = (onlineUsers: { userId: string, status: string }[]) => {
  onlineUsers.forEach(u => u.status = "offline") // safety
  onlineUsers.forEach(u => updateFriendStatus(u.userId, u.status as "online" | "ingame"));
};

const onPresenceOnline = (data: { userId: string, username: string }) => {
  updateFriendStatus(data.userId, "online");
};

const onPresenceOffline = (data: { userId: string }) => {
  updateFriendStatus(data.userId, "offline");
};

const onPresenceStatus = (data: { userId: string, status: "online" | "ingame" | "away" }) => {
  updateFriendStatus(data.userId, data.status === "away" ? "online" : data.status);
};

onMount(() => {
  socketManager.on("presence:list", onPresenceList as (...args: unknown[]) => void);
  socketManager.on("presence:online", onPresenceOnline as (...args: unknown[]) => void);
  socketManager.on("presence:offline", onPresenceOffline as (...args: unknown[]) => void);
  socketManager.on("presence:status", onPresenceStatus as (...args: unknown[]) => void);
});

onDestroy(() => {
  socketManager.off("presence:list", onPresenceList as (...args: unknown[]) => void);
  socketManager.off("presence:online", onPresenceOnline as (...args: unknown[]) => void);
  socketManager.off("presence:offline", onPresenceOffline as (...args: unknown[]) => void);
  socketManager.off("presence:status", onPresenceStatus as (...args: unknown[]) => void);
});

// FORM HANDLING

const formEnhance = () => {
  return async ({ result, update }: any) => {
    if (result.type === 'failure')
      toast.error(result.data?.error ?? "An error occurred");
    else if (result.type === 'success')
      toast.success(result.data?.message ?? "Success");
    await update();
  };
};
</script>

<main class="flex flex-col gap-6 mx-auto w-full h-full">
  
  <div class="flex flex-col gap-4 md:flex-row md:items-end justify-between">
    <div class="space-y-1">
      <h2 class="text-2xl font-bold tracking-tight">Social</h2>
      <p class="text-muted-foreground">Manage your friends list and see who is online.</p>
    </div>

    <form 
      method="POST" 
      action="?/add" 
      use:enhance={formEnhance}
      class="flex w-full md:max-w-xs items-center gap-2"
    >
      <div class="relative w-full">
        <SearchIcon class="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
        <Input 
          type="text" 
          name="username" 
          placeholder="Add by username..." 
          class="pl-9"
          autocomplete="off"
        />
      </div>
      <Button type="submit" size="icon" variant="secondary" class="cursor-pointer">
        <UserPlusIcon class="h-4 w-4" />
        <span class="sr-only">Add</span>
      </Button>
    </form>
  </div>

  <section class="gap-4 grid grid-rows-2 grid-cols-2 h-full">

    <!-- friend list -->
    {#if friends.length === 0}
      <Empty class="border-dashed border-2 border-muted-foreground">
        <EmptyHeader>
          <EmptyMedia variant="icon">
            <FrownIcon />
          </EmptyMedia>
          <EmptyTitle>No friends yet</EmptyTitle>
          <EmptyDescription>Search for a username above to start building your list.</EmptyDescription>
        </EmptyHeader>
      </Empty>
    {:else}
      <Card>
        <CardHeader>
          <CardTitle>Friends ({friends.length})</CardTitle>
          <CardDescription>All your friends are here!</CardDescription>
        </CardHeader>
        <CardContent class="overflow-y-scroll">
          {#each friends as friend (friend.userId)}
            <Card class="overflow-hidden py-0">
              <CardContent class="p-2 flex items-center gap-4">
                
                <div class="relative">
                  <a href="/profile/{friend.userId}">
                    <Avatar class="h-12 w-12 border-2 border-background shadow-sm">
                      <AvatarImage src={friend.avatar} alt={friend.username} />
                      <AvatarFallback class="select-none">{friend.username.slice(0, 2).toUpperCase()}</AvatarFallback>
                    </Avatar>
                  </a>
                  <span class="absolute bottom-0 right-0 flex h-3.5 w-3.5">
                    {#if friend.status === 'online'}
                      <span class="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
                      <span class="relative inline-flex rounded-full h-3.5 w-3.5 bg-green-500 border-2 border-background"></span>
                    {:else if friend.status === 'ingame'}
                      <span class="relative inline-flex rounded-full h-3.5 w-3.5 bg-orange-500 border-2 border-background"></span>
                    {:else}
                      <span class="relative inline-flex rounded-full h-3.5 w-3.5 bg-neutral-400 border-2 border-background"></span>
                    {/if}
                  </span>
                </div>

                <div class="flex-1 min-w-0">
                  <a href="/profile/{friend.userId}" class="font-medium hover:underline truncate block">
                    {friend.username}
                  </a>
                  <div class="text-xs text-muted-foreground flex items-center gap-2">
                    <Badge variant="secondary" class="h-4 min-w-4 text-xs">
                      ELO {friend.currentElo}
                    </Badge>
                    <span class="capitalize">{friend.status}</span>
                  </div>
                </div>

                <div class="flex items-center gap-1">
                  <Button href="/chat/{friend.userId}" variant="ghost" size="icon" class="h-8 w-8 hover:bg-muted hover:text-primary text-muted-foreground">
                    <MessageSquareIcon class="h-4 w-4" />
                    <span class="sr-only">Chat</span>
                  </Button>

                  <Button href="/play/against/{friend.userId}" variant="ghost" class="h-8 w-8 hover:bg-muted hover:text-primary text-muted-foreground">
                    <SwordsIcon class="h-4 w-4" />
                    <span class="sr-only">Fight</span>
                  </Button>

                  <form method="POST" action="?/remove" use:enhance={formEnhance}>
                    <input type="hidden" name="friendId" value={friend.userId} />
                    <Button type="submit" variant="ghost" size="icon" class="h-8 w-8 text-muted-foreground hover:bg-muted hover:text-destructive cursor-pointer">
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

    <!-- activity -->
    <Card>
      <CardHeader>
        <CardTitle>Recent Activity</CardTitle>
        <CardDescription>See what the community is up to.</CardDescription>
      </CardHeader>
      <CardContent>
        <!-- {#each  as } -->
          <Card class="overflow-hidden py-0">
            <CardContent class="p-2 flex items-center gap-4">
              <div class="relative">
                <a href="##">
                  <Avatar class="h-12 w-12 border-2 border-background shadow-sm">
                    <AvatarImage src="avatar url" alt="alt" />
                    <AvatarFallback class="select-none">FB</AvatarFallback>
                  </Avatar>
                </a>
              </div>
              <div class="grid grid-rows-2 grid-cols-1 h-full w-full flex-1 min-h-0 min-w-0">
                <p class="text-sm truncate"><span class="font-bold">Anna Cramling</span> won against <span class="font-bold">Levy Rozman</span>.</p>
                <p class="text-xs text-muted-foreground">Just now</p>
              </div>
            </CardContent>
          </Card>
        <!-- {/each} -->
      </CardContent>
    </Card>

    <!-- suggestions -->
    {#await data.users}
      <!-- animation -->

    {:then users}
      <Card class="col-span-2">
        <CardHeader>
          <CardTitle>Suggested Players</CardTitle>
          <CardDescription>Make some friends and some ennemies</CardDescription>
        </CardHeader>
        <CardContent class="flex justify-start h-full">
          {#each users as {id, avatar, status, username}}
            <Card class="overflow-hidden h-full flex-1 min-h-0 max-w-sm">
              <CardContent class="px-4 flex gap-4 justify-start h-full">
                <div class="flex gap-4 items-center h-fit">
                  <div class="relative">
                    <a href="/profile/{id}">
                      <Avatar class="h-12 w-12 border-2 border-background shadow-sm">
                        <AvatarImage src={avatar} alt={username} />
                        <AvatarFallback class="select-none">{username.slice(0, 2).toUpperCase()}</AvatarFallback>
                      </Avatar>
                    </a>
                    <span class="absolute bottom-0 right-0 flex h-3.5 w-3.5">
                      <span class="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
                      <span class="relative inline-flex rounded-full h-3.5 w-3.5 bg-green-500 border-2 border-background"></span>
                    </span>
                  </div>

                  <div class="flex-1 min-w-0">
                    <a href="/profile/{id}" class="font-medium hover:underline truncate block">{username}</a>
                    <div class="text-xs text-muted-foreground flex items-center gap-2">
                      <Badge variant="secondary" class="h-4 min-w-4 text-xs">
                        ELO 10K+
                      </Badge>
                      <span class="capitalize">Online</span>
                    </div>
                  </div>
                </div>

              </CardContent>
              <CardFooter>
                <Button class="w-full"><UserPlusIcon /> Add me!</Button>
              </CardFooter>
            </Card>
          {/each}
        </CardContent>
      </Card>
    {:catch e}
      <!-- TODO: better error -->
      {e}
    {/await}
  </section>
</main>
