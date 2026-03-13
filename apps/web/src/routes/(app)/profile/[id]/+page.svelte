<script lang="ts">
import { CalendarIcon, MegaphoneIcon, UserPlusIcon } from "@lucide/svelte";
import type { SubmitFunction } from "@sveltejs/kit";
import { Avatar, AvatarFallback, AvatarImage } from "@transc/ui/avatar";
import { Badge } from "@transc/ui/badge";
import { Button } from "@transc/ui/button";
import { toast } from "svelte-sonner";
import { enhance } from "$app/forms";
import { page } from "$app/state";
import * as m from "$lib/paraglide/messages";
import { getLocale } from "$lib/paraglide/runtime";
import { onlineUsersStore } from "$lib/stores/presence.store";
import BadgesCard from "./badges-card.svelte";
import CurrentEloCard from "./current-elo-card.svelte";
import EloHistoryCard from "./elo-history-card.svelte";
import RecentMatchesCard from "./recent-matches-card.svelte";
import WinRatioCard from "./win-ratio-card.svelte";

const { data } = $props();

const user = $derived(data.user);
const stats = $derived(data.stats);
const matches = $derived(data.games);
const eloHistory = $derived(data.eloHistory);
const achievements = $derived(data.achievements);
const peakElo = $derived(data.peakElo);

const isMe = (userId: number) => page.data.user?.id === userId;

const userStatus = (userId: number) =>
  $onlineUsersStore.get(String(userId)) ?? "offline";

const resolveUserStatusTranslation = (userId: number) => {
  switch (userStatus(userId)) {
    case "online":
      return m.online();
    case "offline":
      return m.offline();
    case "ingame":
      return m.ingame();
  }
};

const formEnhance: SubmitFunction = () => {
  return async ({ result, update }) => {
    if (result.type === "failure")
      toast.error(result.data?.error ?? m.toast_error());
    else if (result.type === "success")
      toast.success(result.data?.message ?? m.toast_success());
    await update();
  };
};
</script>

<main>
  <div class="w-full">
    <div class="container mx-auto px-6">
      <div class="flex flex-col md:flex-row md:items-center gap-4">
        <Avatar class="w-32 h-32 ring-4 ring-background shadow-xl text-3xl">
          <AvatarImage
            src={user ? `/api/users/${user.id}/avatar` : undefined}
          />
          <AvatarFallback
            class="select-none bg-linear-to-br from-neutral-800 to-neutral-900 text-white"
          >
            {user?.username.slice(0, 2).toUpperCase()}
          </AvatarFallback>
        </Avatar>

        <div class="flex-1 space-y-1 mt-2 md:mt-0">
          <div class="flex items-center gap-3">
            <h1 class="text-3xl font-bold tracking-tight">{user?.username}</h1>
            <Badge
              variant={(userStatus(user?.id) === "online")
                  ? "default"
                  : "secondary"}
              class="uppercase text-[10px]"
            >
              {resolveUserStatusTranslation(user?.id)}
            </Badge>
          </div>
          <p
            class="text-muted-foreground flex items-center gap-2 text-sm capitalize"
          >
            <CalendarIcon class="w-3 h-3" />
            {m.profile_page_user_joined_on()}
            {new Date(user?.createdAt ?? 0).toLocaleDateString(getLocale(), {
                year: "numeric",
                month: "long",
              })}
          </p>
          <!-- TODO: fix Icon size and "div" align with the previous one -->
          <p class="text-muted-foreground flex items-center gap-2 text-sm">
            <MegaphoneIcon class="w-3 h-3" />
            {#if user?.bio === ''}
              {m.user_profile_link_bio_empty()}
            {:else}
              {m.profile_page_user_bio()}:{user?.bio}
            {/if}
          </p>
        </div>

        {#if !isMe(user?.id ?? 0)}
          <div class="flex gap-2 w-full md:w-auto mt-4 md:mt-0">
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
                <UserPlusIcon class="w-4 h-4" />
                {m.profile_page_button_add()}
              </Button>
            </form>
          </div>
        {:else}
          <Button href="/settings" variant="secondary">
            {m.profile_page_button_edit_profile()}
          </Button>
        {/if}
      </div>
    </div>
  </div>

  <div class="container mx-auto px-4 pt-8 pb-6">
    <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-12 gap-4">
      <CurrentEloCard {stats} {peakElo} />

      <WinRatioCard {stats} />

      <BadgesCard {achievements} />

      <EloHistoryCard {eloHistory} />

      <RecentMatchesCard {matches} />
    </div>
  </div>
</main>
