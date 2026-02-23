<script lang="ts">
import {
  CalendarIcon,
  ChartLineIcon,
  ChartPieIcon,
  HistoryIcon,
  SwordsIcon,
  TrendingUpIcon,
  TriangleAlertIcon,
  UserPlusIcon,
} from "@lucide/svelte";
import { Avatar, AvatarFallback, AvatarImage } from "@transc/ui/avatar";
import { Badge } from "@transc/ui/badge";
import { Button } from "@transc/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@transc/ui/card";
import { type ChartConfig, ChartContainer } from "@transc/ui/chart";
import {
  Empty,
  EmptyContent,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
} from "@transc/ui/empty";
import { Skeleton } from "@transc/ui/skeleton";
import { scaleUtc } from "d3-scale";
import { AreaChart } from "layerchart";
import { page } from "$app/state";
import BadgesCard from "./badges-card.svelte";

const { data } = $props();

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

const chartConfig: ChartConfig = {
  elo: { label: "ELO", color: "var(--chart-1)" },
};

const isMe = (userId: number) => page.data.user?.id === userId;
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
  {:then {user, stats, games, eloHistory, achievements }}
    {@const recentGames = games.filter(g => g.result !== 'abort')}
    <div class="relative w-full">
      <div
        class="h-20 w-full bg-linear-to-r from-violet-600 via-indigo-600 to-blue-600 opacity-90 blur-3xl"
      ></div>

      <div class="container mx-auto px-6">
        <div
          class="relative -mt-16 flex flex-col md:flex-row items-end md:items-center gap-4"
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
                variant={user?.status === 'online' ? 'default' : 'secondary'}
                class="uppercase text-[10px]"
              >
                {user?.status}
              </Badge>
            </div>
            <p class="text-muted-foreground flex items-center gap-2 text-sm">
              <CalendarIcon class="w-3 h-3" /> Member since
              {new Date(user?.createdAt ?? 0).toLocaleDateString(undefined, { year: 'numeric', month: 'long' })}
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
              <form method="POST" action="/profile/me/social?/add">
                <input type="hidden" name="username" value={user?.username}>
                <Button
                  type="submit"
                  variant="outline"
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
        <Card
          class="flex flex-col h-full col-span-1 lg:col-span-3 shadow-sm hover:shadow-md transition-shadow"
        >
          <CardHeader class="pb-2">
            <CardTitle class="flex items-center gap-2 text-base">
              <TrendingUpIcon class="w-5 h-5 text-primary" /> Performance
            </CardTitle>
          </CardHeader>
          <CardContent class="flex-1 flex justify-center items-center">
            <div class="flex flex-col items-center justify-center py-4">
              <span
                class="text-xs text-muted-foreground uppercase font-bold tracking-wider mb-1"
                >ELO</span
              >
              <span class="text-4xl font-black text-primary"
                >{stats.currentElo}</span
              >
            </div>
          </CardContent>
        </Card>

        <Card
          class="flex flex-col h-full col-span-1 lg:col-span-4 shadow-sm hover:shadow-md transition-shadow"
        >
          <CardHeader class="pb-2">
            <CardTitle class="flex items-center gap-2 text-base">
              <ChartPieIcon class="w-5 h-5 text-primary" /> Win Ratio
            </CardTitle>
            <CardDescription>
              {#if stats.gamesPlayed === 0}
                Play more to see your stats!
              {:else}
                Total games played: {stats.gamesPlayed}
              {/if}
            </CardDescription>
          </CardHeader>
          <CardContent class="flex-1 flex flex-col justify-center">
            {#if stats.gamesPlayed !== 0}
              <div
                class="flex h-5 w-full rounded-full overflow-hidden mb-3 shadow-inner"
              >
                <div
                  style="flex: {stats.wins}"
                  class="bg-emerald-500 h-full"
                ></div>
                <div
                  style="flex: {stats.draws}"
                  class="bg-slate-400 h-full"
                ></div>
                <div
                  style="flex: {stats.losses}"
                  class="bg-rose-500 h-full"
                ></div>
              </div>
              <div class="flex justify-between text-sm font-medium">
                <span class="text-emerald-600">{stats.wins} W</span>
                <span class="text-slate-500">{stats.draws} D</span>
                <span class="text-rose-600">{stats.losses} L</span>
              </div>
            {/if}
          </CardContent>
        </Card>

        <BadgesCard {achievements} />

        {#if eloHistory && eloHistory.length > 1}
          {@const minElo = Math.max(0, Math.min(...eloHistory.map(h => h.elo)) - 50)}
          {@const maxElo = Math.max(...eloHistory.map(h => h.elo)) + 50}
          {@const now = new Date()}
          {@const sevenDaysAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000)}
          {@const minDate = eloHistory.length > 0 && eloHistory[0].date < sevenDaysAgo 
            ? eloHistory[0].date 
            : sevenDaysAgo}

          <Card
            class="flex flex-col col-span-1 md:col-span-2 lg:col-span-7 h-100 shadow-sm"
          >
            <CardHeader class="shrink-0">
              <CardTitle class="flex items-center gap-2">
                <ChartLineIcon class="w-5 h-5 text-primary" /> ELO Progression
              </CardTitle>
              <CardDescription>
                Your rating evolution over the last 7 days
              </CardDescription>
            </CardHeader>
            <CardContent class="flex-1 min-h-0 px-4 sm:px-6 pb-6 relative">
              <ChartContainer config={chartConfig} class="h-full w-full">
                <AreaChart
                  data={eloHistory}
                  x="date"
                  xScale={scaleUtc()}
                  xDomain={[minDate, now]}
                  yDomain={[minElo, maxElo]}
                  series={[{key: "elo", label: "ELO", color: chartConfig.elo.color}]}
                  axis="x"
                  padding={{ top: 16, right: 16, bottom: 32, left: 16 }}
                  props={{
                    area: {
                      fillOpacity: 0.4,
                      line: { class: "stroke-2" },
                      motion: "tween"
                    },
                    xAxis: {
                      format: (v: Date) => v.toLocaleDateString(undefined, {month: "short",  day: "2-digit"}),
                    }
                  }}
                />
              </ChartContainer>
            </CardContent>
          </Card>
        {:else}
          <Empty
            class="col-span-1 md:col-span-2 lg:col-span-7 h-100 border-2 border-dashed border-muted-foreground rounded-lg"
          >
            <EmptyMedia variant="icon">
              <ChartLineIcon />
            </EmptyMedia>
            <EmptyContent>
              <EmptyTitle>No Significant Data</EmptyTitle>
              <EmptyDescription>
                Play more ranked matches to display ELO progression.
              </EmptyDescription>
            </EmptyContent>
          </Empty>
        {/if}

        {#if recentGames.length > 0}
          <Card
            class="flex flex-col col-span-1 md:col-span-2 lg:col-span-5 h-100 shadow-sm pb-0 overflow-hidden"
          >
            <CardHeader class="shrink-0">
              <CardTitle class="flex items-center gap-2">
                <HistoryIcon class="w-5 h-5" /> Match History
              </CardTitle>
              <CardDescription>
                Recent games played across all modes
              </CardDescription>
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
                          Normal •
                          {formatCompactDuration(game.startedAt, game.endedAt)}
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
      </div>
    </div>
  {:catch error}
    <div class="container mx-auto p-4 flex justify-center">
      <Card class="w-full max-w-md border-destructive/50 bg-destructive/5">
        <CardHeader>
          <div class="flex items-center gap-2 text-destructive font-bold">
            <TriangleAlertIcon class="h-5 w-5" />
            <CardTitle>Profile Error</CardTitle>
          </div>
          <CardDescription>
            {error.body?.message || "Could not load user profile."}
          </CardDescription>
        </CardHeader>
      </Card>
    </div>
  {/await}
</main>
