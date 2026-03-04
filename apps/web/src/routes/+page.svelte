<script lang="ts">
import LandingPage from "$lib/components/landing/landing-page.svelte";
import Leaderboard from "$lib/components/leaderboard.svelte";
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
