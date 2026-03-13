<script lang="ts">
import { SearchIcon, UserPlusIcon } from "@lucide/svelte";
import type { SubmitFunction } from "@sveltejs/kit";
import { Button } from "@transc/ui/button";
import { Input } from "@transc/ui/input";
import { onMount, untrack } from "svelte";
import { toast } from "svelte-sonner";
import { enhance } from "$app/forms";
import { page } from "$app/state";
import * as m from "$lib/paraglide/messages";
import { onlineUsersStore } from "$lib/stores/presence.store";
import FriendsCard from "./friends-card.svelte";
import RequestsCard from "./requests-card.svelte";
import SuggestedUsersCard from "./suggested-users-card.svelte";

const { data } = $props();

onMount(() => {
  if (page.url.searchParams.get("error") === "chat_not_found") {
    toast.error(m.toast_chat_not_found_error());
  }
});

// svelte-ignore state_referenced_locally: idc
let suggestedUsers = $state(
  data.suggestedUsers.map((user) => ({
    status: "offline" as "offline" | "online" | "ingame",
    ...user,
  })),
);

// svelte-ignore state_referenced_locally: superForms does not accept functions such as `() => data`
let friends = $state(
  data.friends.map((user) => ({
    status: "offline" as "offline" | "online" | "ingame",
    ...user,
  })),
);

$effect(() => {
  const currentOnline = $onlineUsersStore;
  const serverFriends = data.friends;
  const serverSuggestedUsers = data.suggestedUsers;
  const activeGames = data.activeGames;

  untrack(() => {
    friends = serverFriends.map((f) => {
      const rtStatus = (currentOnline.get(String(f.userId)) ?? "offline") as
        | "online"
        | "offline"
        | "ingame";
      const dbGameId = activeGames[f.userId];

      return {
        ...f,
        status: dbGameId ? "ingame" : rtStatus,
        gameId: dbGameId,
      };
    });

    suggestedUsers = serverSuggestedUsers.map((u) => {
      const rtStatus = (currentOnline.get(String(u.userId)) ?? "offline") as
        | "online"
        | "offline"
        | "ingame";
      const dbGameId = activeGames[u.userId];

      return {
        ...u,
        status: dbGameId ? "ingame" : rtStatus,
        gameId: dbGameId,
      };
    });
  });
});

// FORM HANDLING

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

<main class="flex flex-col gap-6 mx-auto w-full pb-16">
  <div class="flex flex-col gap-4 md:flex-row md:items-end justify-between">
    <div class="space-y-1">
      <h2 class="text-2xl font-bold tracking-tight">{m.social_page_title()}</h2>
      <p class="text-muted-foreground">{m.social_page_description()}</p>
    </div>

    <form
      method="POST"
      action="?/add"
      aria-label={m.social_page_search_placeholder()}
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
          placeholder={m.social_page_search_placeholder()}
          class="pl-9"
          autocomplete="off"
        />
      </div>
      <Button type="submit" size="icon" variant="secondary">
        <UserPlusIcon class="h-4 w-4" />
        <span class="sr-only">{m.span_add()}</span>
      </Button>
    </form>
  </div>

  <section class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
    <!-- friend list -->
    <FriendsCard {friends} {formEnhance} />

    <RequestsCard invitations={data.invitations} {formEnhance} />

    <SuggestedUsersCard {suggestedUsers} {formEnhance} />
  </section>
</main>
