<script lang="ts">
import { HistoryIcon, SwordsIcon } from "@lucide/svelte";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@transc/ui/card";
import { Empty } from "@transc/ui/command";
import {
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
} from "@transc/ui/empty";

type Match = {
  gameId: number;
  timeControlSeconds: number;
  incrementSeconds: number;
  result: "abort" | "white_win" | "black_win" | "draw";
  startedAt: Date;
  endedAt: Date;
  userEloBefore: number;
  userEloAfter: number;
  userColor: "white" | "black";
  opponentUserId: number;
  opponentUsername: string;
  opponentPastElo: number;
  opponentAvatar: string | null;
};

const { matches }: { matches: Match[] } = $props();

// svelte-ignore state_referenced_locally: idc
const recentGames = matches.filter((g) => g.result !== "abort");

function getDurationMs(start: Date, end: Date): number {
  return Math.max(0, end.getTime() - start.getTime());
}

function formatCompactDuration(start: Date, end: Date, locale?: string) {
  const diffMs = getDurationMs(start, end);

  const totalSeconds = Math.floor(diffMs / 1000);
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = totalSeconds % 60;

  const nfMinute = new Intl.NumberFormat(locale, {
    style: "unit",
    unit: "minute",
    unitDisplay: "narrow",
  });

  const nfSecond = new Intl.NumberFormat(locale, {
    style: "unit",
    unit: "second",
    unitDisplay: "narrow",
  });

  if (minutes === 0) return nfSecond.format(seconds);
  if (seconds === 0) return nfMinute.format(minutes);

  return `${nfMinute.format(minutes)} ${nfSecond.format(seconds)}`;
}
</script>

{#if recentGames.length > 0}
  <Card
    class="flex flex-col col-span-1 md:col-span-2 lg:col-span-5 h-100 shadow-sm pb-0 overflow-hidden"
  >
    <CardHeader class="shrink-0">
      <CardTitle class="flex items-center gap-2">
        <HistoryIcon class="w-5 h-5" /> Match History
      </CardTitle>
      <CardDescription>Recent games played across all modes</CardDescription>
    </CardHeader>
    <CardContent class="p-0 overflow-y-auto flex-1">
      <div class="flex flex-col divide-y">
        {#each recentGames as game (game.gameId)}
          {@const eloDiff = game.userEloAfter - game.userEloBefore}
          {@const hasWon = (game.result === 'white_win' && game.userColor == 'white')
            || (game.result == 'black_win' && game.userColor == 'black')}
          <div
            class="flex items-center justify-between p-4 hover:bg-accent/20 transition-colors"
          >
            <div class="flex items-center gap-4">
              <div
                class={`w-1.5 h-10 rounded-full ${
                  hasWon ? 'bg-emerald-500' : game.result === 'draw' ? 'bg-slate-400' : 'bg-rose-500'
                }`}
              ></div>
              <div>
                <div class="flex items-center gap-2">
                  <span class="font-bold">
                    {game.result === 'white_win' ? 'Won' : game.result === 'black_win' ? 'Lost' : 'Draw'}
                  </span>
                  <span class="text-xs text-muted-foreground"
                    >vs
                    <a
                      href="/profile/{game.opponentUserId}"
                      class="hover:underline"
                      >{game.opponentUsername}</a
                    >
                  </span>
                </div>
                <p class="text-sm text-muted-foreground">
                  Normal •{formatCompactDuration(game.startedAt, game.endedAt)}
                </p>
              </div>
            </div>

            <div class="text-right">
              <span
                class={`text-sm font-bold ${eloDiff > 0 ? 'text-emerald-600' : eloDiff < 0 ? 'text-rose-600' : 'text-slate-500'}`}
              >
                {#if eloDiff > 0}
                  +
                {/if}
                {eloDiff}
              </span>
              <p class="text-xs text-muted-foreground">
                {new Intl.DateTimeFormat(undefined, {dateStyle: 'short', timeStyle: 'short'}).format(game.endedAt)}
              </p>
            </div>
          </div>
        {/each}
      </div>
    </CardContent>
  </Card>
{:else}
  <Empty
    class="col-span-1 md:col-span-2 lg:col-span-5 h-100 border-2 border-dashed border-muted-foreground rounded-lg"
  >
    <EmptyMedia variant="icon">
      <SwordsIcon />
    </EmptyMedia>
    <EmptyHeader>
      <EmptyTitle>No Recent Matches</EmptyTitle>
      <EmptyDescription>
        Play a few matches to see your statistics with details here.
      </EmptyDescription>
    </EmptyHeader>
  </Empty>
{/if}
