<script lang="ts">
import {
  ContactRoundIcon,
  FrownIcon,
  MessageSquareIcon,
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
import UserProfileLink from "$lib/components/user-profile-link.svelte";
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
      {m.friends_card_title()}({friends.length})
    </CardTitle>
    <CardDescription>{m.friends_card_description()}</CardDescription>
  </CardHeader>
  <CardContent
    class={`overflow-y-scroll flex flex-col gap-2 ${friends.length === 0 ? "justify-center items-center h-full" : ""}`}
  >
    {#if friends.length !== 0}
      {#each friends as friend (friend.userId)}
        <Card class="overflow-hidden py-0">
          <CardContent class="p-2 flex justify-between">
            <UserProfileLink
              userId={friend.userId}
              fallbackUsername={friend.username}
              class="flex items-center gap-4"
            >
              <UserAvatar
                userId={friend.userId}
                avatarUrl={friend.avatar}
                username={friend.username}
                class="h-12 w-12 border"
              />
              <div class="flex flex-col">
                <span class="hover:underline">{friend.username}</span>
                <Badge variant="default">{friend.currentElo}</Badge>
              </div>
            </UserProfileLink>

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

              <form method="POST" action="?/remove" use:enhance={formEnhance}>
                <input type="hidden" name="friendId" value={friend.userId}>
                <Button
                  type="submit"
                  variant="ghost"
                  size="icon"
                  class="h-8 w-8 text-muted-foreground hover:bg-muted hover:text-destructive"
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
