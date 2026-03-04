<script lang="ts">
import { BrushCleaningIcon, HandHeartIcon } from "@lucide/svelte";
import type { SubmitFunction } from "@sveltejs/kit";
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

const {
  invitations,
  formEnhance,
}: {
  invitations: {
    userId: number;
    username: string;
    avatar: string | null;
    type: "received" | "sent";
  }[];
  formEnhance: SubmitFunction;
} = $props();
</script>

<Card class="flex flex-col col-span-1 lg:col-span-3 min-h-100 grow">
  <CardHeader>
    <CardTitle class="inline-flex gap-2 items-end">
      <HandHeartIcon />
      Friend Requests
    </CardTitle>
    <CardDescription>People who want to connect with you.</CardDescription>
  </CardHeader>
  <CardContent class="overflow-y-auto flex-1 flex flex-col gap-2">
    {#if invitations && invitations.length > 0}
      {#each invitations as invite (invite.userId)}
        <Card class="overflow-hidden py-0 shrink-0">
          <CardContent class="p-2 px-3 flex items-center justify-between gap-4">
            <UserProfileLink
              userId={invite.userId}
              fallbackUsername={invite.username}
              class="flex items-center gap-4"
              href="/profile/{invite.userId}"
            >
              <UserAvatar
                username={invite.username}
                userId={invite.userId}
                avatarUrl={invite.avatar}
                class="h-12 w-12 border"
              />
              <span class="hover:underline">{invite.username}</span>
            </UserProfileLink>

            {#if invite.type === 'received'}
              <div class="flex items-center gap-1">
                <form method="POST" action="?/accept" use:enhance={formEnhance}>
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
                <form method="POST" action="?/reject" use:enhance={formEnhance}>
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
      <Empty>
        <EmptyHeader>
          <EmptyMedia variant="icon">
            <BrushCleaningIcon />
          </EmptyMedia>
          <EmptyTitle>No pending requests</EmptyTitle>
          <EmptyDescription>
            We'll show your friend requests here.
          </EmptyDescription>
        </EmptyHeader>
      </Empty>
    {/if}
  </CardContent>
</Card>
