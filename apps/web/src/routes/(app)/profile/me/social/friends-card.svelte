<script lang="ts">
  import {
    ContactRoundIcon,
    FrownIcon,
    MessageSquareIcon,
    SwordsIcon,
    UserMinusIcon,
  } from "@lucide/svelte";
  import type { SubmitFunction } from "@sveltejs/kit";
  import { Badge } from "@transc/ui/badge";
  import { Button } from "@transc/ui/button";
  import {
    Card,
    CardContent,
    CardDescription,
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
  import { enhance } from "$app/forms";
  import UserAvatar from "$lib/components/user-avatar.svelte";
  import * as m from "$lib/paraglide/messages";

  const {
    friends,
    formEnhance,
  }: {
    friends: {
      userId: number;
      username: string;
      avatar: string | null;
      bio: string;
      currentElo: number;
      status: "offline" | "online" | "ingame";
    }[];
    formEnhance: SubmitFunction;
  } = $props();
</script>

<Card class="col-span-1 lg:col-span-2 min-h-100 shadow-sm grow">
  <CardHeader>
    <CardTitle class="inline-flex gap-2 items-end">
      <ContactRoundIcon />
      {m.friends_card_title()} ({friends.length})
    </CardTitle>
    <CardDescription>{m.friends_card_description()}</CardDescription>
  </CardHeader>
  <CardContent
    class={`overflow-y-scroll flex flex-col gap-2 ${friends.length === 0 ? "justify-center items-center h-full" : ""}`}
  >
    {#if friends.length !== 0}
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
                {#if friend.status === "online"}
                  <span
                    class="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"
                  ></span>
                  <span
                    class="relative inline-flex rounded-full h-3.5 w-3.5 bg-green-500 border-2 border-background"
                  ></span>
                {:else if friend.status === "ingame"}
                  <span
                    class="relative inline-flex rounded-full h-3.5 w-3.5 bg-purple-500 border-2 border-background"
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
                <!-- TODO: maybe i18n or delete? -->
                <span class="sr-only">Chat</span>
              </Button>

              <Button
                href="/play/against/{friend.userId}"
                variant="ghost"
                class="h-8 w-8 hover:bg-muted hover:text-primary text-muted-foreground"
              >
                <SwordsIcon class="h-4 w-4" />
                <!-- TODO: maybe i18n or delete? -->
                <span class="sr-only">Fight</span>
              </Button>

              <form method="POST" action="?/remove" use:enhance={formEnhance}>
                <input type="hidden" name="friendId" value={friend.userId} />
                <Button
                  type="submit"
                  variant="ghost"
                  size="icon"
                  class="h-8 w-8 text-muted-foreground hover:bg-muted hover:text-destructive cursor-pointer"
                >
                  <UserMinusIcon class="h-4 w-4" />
                  <!-- TODO: maybe i18n or delete? -->
                  <span class="sr-only">Remove</span>
                </Button>
              </form>
            </div>
          </CardContent>
        </Card>
      {/each}
    {:else}
      <Empty>
        <EmptyHeader>
          <EmptyMedia variant="icon">
            <FrownIcon />
          </EmptyMedia>
          <EmptyTitle>{m.friends_card_empty_title()}</EmptyTitle>
          <EmptyDescription>
            {m.friends_card_empty_description()}
          </EmptyDescription>
        </EmptyHeader>
      </Empty>
    {/if}
  </CardContent>
</Card>
