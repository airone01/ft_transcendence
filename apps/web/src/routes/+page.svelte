<script lang="ts">
import { Badge } from "@transc/ui/badge";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@transc/ui/card";
import LandingPage from "$lib/components/landing/landing-page.svelte";

const { data } = $props();
</script>

{#if data.user}
  <main
    class="container mx-auto max-w-4xl p-6 h-full flex flex-col gap-6 mt-11"
  >
    <header>
      <h2 class="text-3xl font-bold tracking-tight">Leaderboard</h2>
      <p class="text-muted-foreground">Top players ranked by their ELO.</p>
    </header>

    <Card class="flex-1 overflow-hidden flex flex-col">
      <CardHeader>
        <CardTitle>Global Ranking</CardTitle>
        <CardDescription>
          The best of the best across the server.
        </CardDescription>
      </CardHeader>

      <CardContent class="overflow-y-auto flex-1">
        <div class="flex flex-col gap-2">
          {#if data.leaderboard && data.leaderboard.length > 0}
            {#each data.leaderboard as player, i (player.userId)}
              <div
                class="flex items-center justify-between p-4 border rounded-lg hover:bg-accent/40 transition-colors"
              >
                <div class="flex items-center gap-4">
                  <span
                    class="text-xl font-bold w-8 text-center text-muted-foreground"
                  >
                    #{i + 1}
                  </span>
                  <a
                    href="/profile/{player.userId}"
                    class="font-medium hover:underline text-lg"
                  >
                    {player.username}
                  </a>
                </div>
                <Badge variant="secondary" class="text-sm px-3 py-1">
                  ELO {player.elo}
                </Badge>
              </div>
            {/each}
          {:else}
            <p class="text-center text-muted-foreground py-8">
              No players found yet.
            </p>
          {/if}
        </div>
      </CardContent>
    </Card>
  </main>
{:else}
  <LandingPage />
{/if}
