<script lang="ts">
import { HistoryIcon, SwordsIcon } from "@lucide/svelte";
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
import * as m from "$lib/paraglide/messages";

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

<Card
  class="flex flex-col col-span-1 md:col-span-2 lg:col-span-5 h-100 shadow-sm pb-0 overflow-hidden"
>
  <CardHeader class="shrink-0">
    <CardTitle class="flex items-center gap-2">
      <HistoryIcon class="w-5 h-5 text-primary" />
      {m.recent_matches_card_title()}
    </CardTitle>
    <CardDescription></CardDescription>
  </CardHeader>
  <CardContent
    class={`p-0 overflow-y-auto flex-1 ${recentGames.length <= 0 ? "flex items-center" : ""}`}
  >
    {#if recentGames.length > 0}
      <div class="flex flex-col divide-y">
        {#each recentGames as game (game.gameId)}
          {@const eloDiff = game.userEloAfter - game.userEloBefore}
          {@const hasWon =
            (game.result === "white_win" && game.userColor == "white") ||
            (game.result == "black_win" && game.userColor == "black")}
          <div
            class="flex items-center justify-between p-4 hover:bg-accent/20 transition-colors"
          >
            <div class="flex items-center gap-4">
              <div
                class={`w-1.5 h-10 rounded-full ${
                  hasWon
                    ? "bg-emerald-500"
                    : game.result === "draw"
                      ? "bg-slate-400"
                      : "bg-rose-500"
                }`}
              ></div>
              <div>
                <div class="flex items-center gap-2">
                  <span class="font-bold">
                    {hasWon
                      ? m.recent_matches_card_won()
                      : game.result === "draw"
                        ? m.recent_matches_card_draw()
                        : m.recent_matches_card_lost()}
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
                  <!-- TODO: i18n or delete? -->
                  Normal •{formatCompactDuration(game.startedAt, game.endedAt)}
                </p>
              </div>
            </div>

            <div class="text-right">
              <span
                class={`text-sm font-bold ${eloDiff > 0 ? "text-emerald-700" : eloDiff < 0 ? "text-rose-700" : "text-slate-600"}`}
              >
                {#if eloDiff > 0}
                  +
                {/if}
                {eloDiff}
              </span>
              <p class="text-xs text-muted-foreground">
                {new Intl.DateTimeFormat(undefined, {
                  dateStyle: "short",
                  timeStyle: "short",
                }).format(game.endedAt)}
              </p>
            </div>
          </div>
        {/each}
      </div>
    {:else}
      <Empty>
        <EmptyMedia variant="icon">
          <SwordsIcon />
        </EmptyMedia>
        <EmptyHeader>
          <EmptyTitle>{m.recent_matches_card_empty_title()}</EmptyTitle>
          <EmptyDescription>
            {m.recent_matches_card_empty_description()}
          </EmptyDescription>
        </EmptyHeader>
      </Empty>
    {/if}
  </CardContent>
</Card>
