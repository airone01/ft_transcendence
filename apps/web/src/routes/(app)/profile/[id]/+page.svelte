<script lang="ts">
import {
  CalendarIcon,
  MegaphoneIcon,
  SwordsIcon,
  TriangleAlertIcon,
  UserPlusIcon,
} from "@lucide/svelte";
import type { SubmitFunction } from "@sveltejs/kit";
import { Avatar, AvatarFallback, AvatarImage } from "@transc/ui/avatar";
import { Badge } from "@transc/ui/badge";
import { Button } from "@transc/ui/button";
import { Card, CardDescription, CardHeader, CardTitle } from "@transc/ui/card";
import { Skeleton } from "@transc/ui/skeleton";
import { toast } from "svelte-sonner";
import { enhance } from "$app/forms";
import { page } from "$app/state";
import { onlineUsersStore } from "$lib/stores/presence.store";
import BadgesCard from "./badges-card.svelte";
import CurrentEloCard from "./current-elo-card.svelte";
import EloHistoryCard from "./elo-history-card.svelte";
import RecentMatchesCard from "./recent-matches-card.svelte";
import WinRatioCard from "./win-ratio-card.svelte";

const { data } = $props();

const isMe = (userId: number) => page.data.user?.id === userId;

const userStatus = (userId: number) =>
  $onlineUsersStore.get(String(userId)) ?? "offline";

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

<main class="w-full">
  {#await data.userPromise}
    <div class="container mx-auto p-6 space-y-6">
      <div class="h-48 w-full rounded-xl bg-muted animate-pulse"></div>
      <div class="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Skeleton class="h-64 w-full" />
        <Skeleton class="h-64 w-full md:col-span-2" />
      </div>
    </div>
  {:then { user, stats, games: matches, eloHistory, achievements, peakElo }}
    <div class="relative w-full">
      <div
        class="h-20 w-full bg-linear-to-r from-violet-600 via-indigo-600 to-blue-600 opacity-90 blur-3xl"
      ></div>

      <div class="container mx-auto px-6">
        <div
          class="relative -mt-16 flex flex-col md:flex-row md:items-center gap-4"
        >
          <Avatar class="w-32 h-32 ring-4 ring-background shadow-xl text-3xl">
            <AvatarImage src={user?.avatar} />
            <AvatarFallback
              class="select-none bg-linear-to-br from-neutral-800 to-neutral-900 text-white"
            >
              {user?.username.slice(0, 2).toUpperCase()}
            </AvatarFallback>
          </Avatar>

          <div class="flex-1 space-y-1 mt-2 md:mt-0">
            <div class="flex items-center gap-3">
              <h1 class="text-3xl font-bold tracking-tight">
                {user?.username}
              </h1>
              <Badge
                variant={(userStatus(user?.id) === "online")
                  ? "default"
                  : "secondary"}
                class="uppercase text-[10px]"
              >
                {userStatus(user?.id)}
              </Badge>
            </div>
            <p class="text-muted-foreground flex items-center gap-2 text-sm">
              <CalendarIcon class="w-3 h-3" /> Member since
              {new Date(user?.createdAt ?? 0).toLocaleDateString(undefined, {
                year: "numeric",
                month: "long",
              })}
            </p>
            <!-- TODO: fix Icon size and "div" align with the previous one -->
            <p class="text-muted-foreground flex items-center gap-2 text-sm">
              <MegaphoneIcon class="w-3 h-3" />
              Biography:
              {user?.bio}
            </p>
          </div>

          {#if !isMe(user?.id ?? 0)}
            <div class="flex gap-2 w-full md:w-auto mt-4 md:mt-0">
              <Button
                href={`/play/challenge/${user?.id}`}
                class="flex-1 md:flex-none gap-2"
              >
                <SwordsIcon class="w-4 h-4" /> Challenge
              </Button>
              <form
                method="POST"
                action="/profile/me/social?/add"
                use:enhance={formEnhance}
                class="w-full"
              >
                <input type="hidden" name="username" value={user?.username}>
                <Button
                  type="submit"
                  variant="secondary"
                  class="flex-1 md:flex-none gap-2"
                >
                  <UserPlusIcon class="w-4 h-4" /> Add Friend
                </Button>
              </form>
            </div>
          {:else}
            <Button href="/settings/profile" variant="secondary">
              Edit Profile
            </Button>
          {/if}
        </div>
      </div>
    </div>

    <div class="container mx-auto px-4 py-8">
      <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-12 gap-4">
        <CurrentEloCard {stats} {peakElo} />

        <WinRatioCard {stats} />

        <BadgesCard {achievements} />

        <EloHistoryCard {eloHistory} />

        <RecentMatchesCard {matches} />
      </div>
    </div>
  {:catch _}
    <div class="container mx-auto p-4 flex justify-center">
      <Card class="w-full max-w-md border-destructive/50 bg-destructive/5">
        <CardHeader>
          <div class="flex items-center gap-2 text-destructive font-bold">
            <TriangleAlertIcon class="h-5 w-5" />
            <CardTitle>Profile Error</CardTitle>
          </div>
          <CardDescription>Could not load user profile.</CardDescription>
        </CardHeader>
      </Card>
    </div>
  {/await}
</main>
