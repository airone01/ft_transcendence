<script lang="ts">
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@transc/ui/card";
import LeaderboardAvatar from "$lib/components/leaderboard-avatar.svelte";
import type { User } from "$lib/server/db-services";
import type { UserNoPass } from "../../app";

const {
  data,
}: {
  data: {
    user: UserNoPass;
    userPromises: Record<number, Promise<unknown>>;
    leaderboard: {
      userId: number;
      username: string;
      elo: number;
    }[];
  };
} = $props();
</script>

<main
  class="container mx-auto max-w-4xl p-4 md:p-6 h-full flex flex-col gap-6 mt-11"
>
  <header class="text-center sm:text-left">
    <h2 class="text-3xl font-bold tracking-tight">Leaderboard</h2>
    <p class="text-muted-foreground">Top players ranked by their ELO.</p>
  </header>

  <Card class="flex-1 overflow-hidden flex flex-col shadow-sm">
    <CardHeader>
      <CardTitle>Global Ranking</CardTitle>
      <CardDescription>The best of the best across the server.</CardDescription>
    </CardHeader>

    <CardContent class="overflow-y-auto flex-1 p-0 sm:p-6">
      {#if data.leaderboard && data.leaderboard.length > 0}
        {@const topThree = data.leaderboard.slice(0, 3)}
        {@const rest = data.leaderboard.slice(3)}

        <div
          class="flex items-end justify-center gap-2 sm:gap-4 md:gap-8 pt-8 pb-10 px-2 sm:px-4"
        >
          {#each topThree as player, i}
            {@const isFirst = i === 0}
            {@const isSecond = i === 1}

            <div
              class="flex flex-col items-center {isFirst ? 'order-2' : isSecond ? 'order-1' : 'order-3'}"
            >
              <div
                class="flex flex-col items-center mb-3 z-10 transition-transform hover:-translate-y-1"
              >
                <LeaderboardAvatar
                  i={i}
                  currentElo={player.elo}
                  userPromise={data.userPromises[player.userId] as Promise<User>}
                  fallbackText={player.username.slice(0, 2).toUpperCase()}
                  class="w-full h-full border-none"
                />
              </div>

              <div
                class="w-20 sm:w-24 md:w-32 rounded-t-lg shadow-inner flex justify-center pt-2 md:pt-4 transition-all
                  {isFirst ? 'h-32 md:h-40 bg-linear-to-t from-yellow-500/10 to-yellow-500/40 border-t-4 border-yellow-500' : 
                   isSecond ? 'h-24 md:h-28 bg-linear-to-t from-slate-400/10 to-slate-400/40 border-t-4 border-slate-400' : 
                   'h-20 md:h-24 bg-linear-to-t from-amber-600/10 to-amber-600/40 border-t-4 border-amber-600'}"
              >
                <span
                  class="text-3xl md:text-5xl font-black text-foreground/20"
                >
                  {i + 1}
                </span>
              </div>
            </div>
          {/each}
        </div>

        <div class="flex flex-col gap-2 px-4 sm:px-0 pb-4">
          {#each rest as player, i (player.userId)}
            <div
              class="flex items-center justify-between p-4 border rounded-lg hover:bg-accent/10 transition-colors"
            >
              <LeaderboardAvatar
                i={i+3}
                currentElo={player.elo}
                userPromise={data.userPromises[player.userId] as Promise<User>}
                fallbackText={player.username.slice(0, 2).toUpperCase()}
                class="w-10 h-10 border shadow-sm"
              />
            </div>
          {/each}
        </div>
      {:else}
        <div
          class="flex flex-col items-center justify-center py-16 text-muted-foreground"
        >
          <p>No players found yet.</p>
        </div>
      {/if}
    </CardContent>
  </Card>
</main>
