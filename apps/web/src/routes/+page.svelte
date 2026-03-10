<script lang="ts">
import { toast } from "svelte-sonner";
import { goto } from "$app/navigation";
import { page } from "$app/state";
import LandingPage from "$lib/components/landing/landing-page.svelte";
import Leaderboard from "$lib/components/leaderboard.svelte";
import { m } from "$lib/paraglide/messages";
import type { UserNoPass } from "../app";

const {
  data,
}: {
  data: {
    user: UserNoPass | null;
    userPromises?: Record<number, Promise<unknown>>;
    leaderboard:
      | {
          userId: number;
          username: string;
          elo: number;
        }[]
      | undefined;
  };
} = $props();

$effect(() => {
  const errorType = page.url.searchParams.get("error");

  if (errorType === "discord_auth") {
    toast.error(m.oauth_error(), {description: m.oauth_internal_error()});

    const cleanUrl = new URL(page.url);
    cleanUrl.searchParams.delete("error");

    goto(cleanUrl.pathname + cleanUrl.search, {
      replaceState: true,
      keepFocus: true,
    });
  }
});

type ValidData = {
  user: UserNoPass;
  userPromises: Record<number, Promise<unknown>>;
  leaderboard: {
    userId: number;
    username: string;
    elo: number;
  }[];
};
</script>

{#if data.user && data.userPromises && data.leaderboard}
  <Leaderboard data={data as ValidData} />
{:else}
  <LandingPage />
{/if}
