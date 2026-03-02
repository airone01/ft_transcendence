<script lang="ts">
import { FrownIcon, ThumbsUpIcon, UserPlusIcon } from "@lucide/svelte";
import type { SubmitFunction } from "@sveltejs/kit";
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
import { enhance } from "$app/forms";
import UserAvatar from "$lib/components/user-avatar.svelte";

const {
  suggestedUsers,
  formEnhance,
}: {
  suggestedUsers: {
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

<Card class="col-span-1 md:col-span-2 lg:col-span-5">
  <CardHeader>
    <CardTitle class="inline-flex gap-2 items-end">
      <ThumbsUpIcon /> Suggested Players
    </CardTitle>
    <CardDescription>Make some friends and some enemies</CardDescription>
  </CardHeader>
  <CardContent class="flex flex-col lg:flex-row justify-start h-full gap-4 overflow-x-scroll">
    {#if (suggestedUsers?.length ?? 0 > 0)}
      {#each suggestedUsers as {userId, avatar, username, currentElo}}
        <Card class="overflow-hidden flex flex-col flex-1 min-h-0 min-w-xs lg:max-w-sm max-w-full lg:w-auto">
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
    {:else}
      <Empty>
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
  </CardContent>
</Card>
