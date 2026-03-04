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
import * as m from "$lib/paraglide/messages";

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
  <CardHeader class="shrink-0 pb-3">
    <CardTitle class="inline-flex gap-2 items-end">
      <HandHeartIcon />
      {m.requests_card_title()}
    </CardTitle>
    <CardDescription>{m.requests_card_description()}</CardDescription>
  </CardHeader>
  <CardContent class="overflow-y-auto flex-1 flex flex-col gap-2">
    {#if invitations && invitations.length > 0}
      {#each invitations as invite (invite.userId)}
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

            {#if invite.type === "received"}
              <div class="flex items-center gap-1">
                <form method="POST" action="?/accept" use:enhance={formEnhance}>
                  <input type="hidden" name="userId" value={invite.userId}>
                  <Button
                    type="submit"
                    variant="secondary"
                    size="sm"
                    class="h-8 cursor-pointer"
                  >
                    {m.requests_card_received_button_accept()}
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
                    {m.requests_card_received_button_reject()}
                  </Button>
                </form>
              </div>
            {:else if invite.type === "sent"}
              <div class="flex items-center">
                <CardDescription>
                  {m.requests_card_sent_description()}
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
          <EmptyTitle>{m.requests_card_empty_title()}</EmptyTitle>
          <EmptyDescription>
            {m.requests_card_empty_description()}
          </EmptyDescription>
        </EmptyHeader>
      </Empty>
    {/if}
  </CardContent>
</Card>
