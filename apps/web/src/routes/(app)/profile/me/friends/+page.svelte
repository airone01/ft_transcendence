<script lang="ts">
import { enhance } from "$app/forms";
import { Avatar, AvatarFallback, AvatarImage } from "@transc/ui/avatar";
import { Button } from "@transc/ui/button";
import { Input } from "@transc/ui/input";
import { Card, CardContent } from "@transc/ui/card";
import { Separator } from "@transc/ui/separator";
import { UserMinusIcon, UserPlusIcon, SearchIcon, MessageSquareIcon } from "@lucide/svelte";
import { toast } from "svelte-sonner";
import { socketManager } from "$lib/stores/socket.svelte";
import { onDestroy, onMount } from "svelte";

let { data, form } = $props();

// svelte-ignore state_referenced_locally: superForms does not accept functions such as `() => data`
let friends = $state(data.friends);

// Sync with server data when it changes (e.g. after form action)
$effect(() => {
  // We merge the server data with current known statuses to avoid flickering "offline" on reload
  const serverFriends = data.friends;
  friends = serverFriends.map(f => {
    const existing = friends.find(ef => ef.userId === f.userId);
    return existing ? { ...f, status: existing.status } : f;
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
    if (result.type === 'failure') {
      toast.error(result.data?.error || "An error occurred");
    } else if (result.type === 'success') {
      toast.success(result.data?.message || "Success");
    }
    await update();
  };
};
</script>

<main class="flex flex-col gap-6 max-w-3xl mx-auto w-full">
  
  <div class="flex flex-col gap-4 md:flex-row md:items-end justify-between">
    <div class="space-y-1">
      <h2 class="text-2xl font-bold tracking-tight">Friends</h2>
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

  <Separator />

  {#if friends.length === 0}
    <div class="flex flex-col items-center justify-center py-12 text-center text-muted-foreground border rounded-lg border-dashed">
      <div class="p-4 bg-muted/50 rounded-full mb-3">
        <UserPlusIcon class="h-8 w-8 opacity-50" />
      </div>
      <p class="text-lg font-medium">No friends yet</p>
      <p class="text-sm">Search for a username above to start building your list.</p>
    </div>
  {:else}
    <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
      {#each friends as friend (friend.userId)}
        <Card class="overflow-hidden py-0">
          <CardContent class="p-4 flex items-center gap-4">
            
            <div class="relative">
              <a href="/profile/{friend.userId}">
                <Avatar class="h-12 w-12 border-2 border-background shadow-sm">
                  <AvatarImage src={friend.avatar} alt={friend.username} />
                  <AvatarFallback>{friend.username.slice(0, 2).toUpperCase()}</AvatarFallback>
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
                <span class="font-mono bg-muted px-1 rounded-sm text-[10px] font-bold">
                  ELO {friend.currentElo}
                </span>
                <span class="capitalize">{friend.status}</span>
              </div>
            </div>

            <div class="flex items-center gap-1">
              <Button href="/chat/{friend.userId}" variant="ghost" size="icon" class="h-8 w-8 text-muted-foreground">
                <MessageSquareIcon class="h-4 w-4" />
                <span class="sr-only">Chat</span>
              </Button>

              <form method="POST" action="?/remove" use:enhance={formEnhance}>
                <input type="hidden" name="friendId" value={friend.userId} />
                <Button type="submit" variant="ghost" size="icon" class="h-8 w-8 text-muted-foreground hover:text-destructive cursor-pointer">
                  <UserMinusIcon class="h-4 w-4" />
                  <span class="sr-only">Remove</span>
                </Button>
              </form>
            </div>

          </CardContent>
        </Card>
      {/each}
    </div>
  {/if}
</main>
