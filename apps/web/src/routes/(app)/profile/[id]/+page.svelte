<script lang="ts">
import { page } from "$app/state";
import { Avatar, AvatarFallback, AvatarImage } from '@transc/ui/avatar';
import { Button } from '@transc/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@transc/ui/card';
import { Badge } from "@transc/ui/badge";
import { Skeleton } from "@transc/ui/skeleton";
import { 
  TriangleAlert, 
  Swords, 
  UserPlus, 
  Trophy, 
  TrendingUp, 
  History, 
  Calendar, 
  Medal,
  Target
} from '@lucide/svelte';

let { data } = $props();

const mockAchievements = [
  { name: "Speed Demon", icon: Target, desc: "Won in under 30s" },
  { name: "Tactician", icon: Swords, desc: "Win streak of 5" },
  { name: "Veteran", icon: Medal, desc: "Played 100+ games" },
];

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

  if (minutes === 0)
    return nfSecond.format(seconds);
  if (seconds === 0)
    return nfMinute.format(minutes);

  return `${nfMinute.format(minutes)} ${nfSecond.format(seconds)}`;
}

const isMe = (userId: number) => page.data.user?.id === userId;
</script>

<main class="flex flex-col flex-1 min-h-0 min-w-0 w-full gap-6">

  {#await data.userPromise}
    <div class="container mx-auto p-6 space-y-6">
      <div class="h-48 w-full rounded-xl bg-muted animate-pulse"></div>
      <div class="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Skeleton class="h-64 w-full" />
        <Skeleton class="h-64 w-full md:col-span-2" />
      </div>
    </div>

  {:then {user, stats, games}} 
    <div class="relative w-full">
      <div class="h-20 w-full bg-linear-to-r from-violet-600 via-indigo-600 to-blue-600 opacity-90 blur-3xl"></div>
      
      <div class="container mx-auto px-6">
        <div class="relative -mt-16 flex flex-col md:flex-row items-end md:items-center gap-4">
          
          <Avatar class="w-32 h-32 ring-4 ring-background shadow-xl text-3xl">
            <AvatarImage src={user?.avatar} />
            <AvatarFallback class="bg-linear-to-br from-neutral-800 to-neutral-900 text-white">
              {user?.username.slice(0, 2).toUpperCase()}
            </AvatarFallback>
          </Avatar>

          <div class="flex-1 space-y-1 mt-2 md:mt-0">
            <div class="flex items-center gap-3">
              <h1 class="text-3xl font-bold tracking-tight">{user?.username}</h1>
              <Badge variant={user?.status === 'online' ? 'default' : 'secondary'} class="uppercase text-[10px]">
                {user?.status}
              </Badge>
            </div>
            <p class="text-muted-foreground flex items-center gap-2 text-sm">
              <Calendar class="w-3 h-3" /> 
              Member since {new Date(user?.createdAt ?? 0).toLocaleDateString(undefined, { year: 'numeric', month: 'long' })}
            </p>
          </div>

          {#if !isMe(user?.id ?? 0)}
            <div class="flex gap-2 w-full md:w-auto mt-4 md:mt-0">
              <Button href={`/play/challenge/${user?.id}`} class="flex-1 md:flex-none gap-2">
                <Swords class="w-4 h-4" /> Challenge
              </Button>
              <form method="POST" action="/profile/me/social?/add">
                 <input type="hidden" name="username" value={user?.username} />
                 <Button type="submit" variant="outline" class="flex-1 md:flex-none gap-2">
                   <UserPlus class="w-4 h-4" /> Add Friend
                 </Button>
              </form>
            </div>
          {:else}
             <Button href="/settings/profile" variant="secondary">Edit Profile</Button>
          {/if}
        </div>
      </div>
    </div>

    <div class="container mx-auto px-4 grid grid-cols-1 lg:grid-cols-12 gap-4 h-full flex-1">
      
      <div class="lg:col-span-4 gap-4 max-h-full flex flex-col">
        
        <!-- performance -->
        <Card>
          <CardHeader>
            <CardTitle class="flex items-center gap-2">
              <TrendingUp class="w-5 h-5 text-primary" /> Performance
            </CardTitle>
          </CardHeader>
          <CardContent class="flex justify-center items-center">
            <div class="p-3 border rounded-lg flex flex-col items-center justify-center h-full w-full">
              <span class="text-xs text-muted-foreground uppercase font-bold">ELO</span>
              <span class="text-2xl font-bold">{stats.currentElo}</span>
            </div>
          </CardContent>
        </Card>

        <!-- win ratio -->
        <Card>
          <CardHeader>
            <CardTitle class="text-base">Win Ratio</CardTitle>
            <CardDescription>
              {#if stats.gamesPlayed === 0}
                Play more to see yout stats!
              {:else}
                {stats.gamesPlayed} Total games played
              {/if}
            </CardDescription>
          </CardHeader>
          {#if stats.gamesPlayed !== 0}
            <CardContent>
              <div class="flex h-4 w-full rounded-full overflow-hidden mb-2">
                <div style="flex: {stats.wins}%" class="bg-green-500 h-full"></div>
                <div style="flex: {stats.draws}%" class="bg-gray-400 h-full"></div>
                <div style="flex: {stats.losses}%" class="bg-red-500 h-full"></div> </div>
              <div class="flex justify-between text-xs text-muted-foreground">
                <span class="text-green-600 font-bold">{stats.wins} W</span>
                <span>{stats.draws} D</span>
                <span class="text-red-600 font-bold">{stats.losses} L</span>
              </div>
            </CardContent>
          {/if}
        </Card>

        <!-- recent badges -->
        <Card class="flex-1">
          <CardHeader>
            <CardTitle class="flex items-center gap-2 text-base">
              <Trophy class="w-4 h-4 text-yellow-500" /> Achievements
            </CardTitle>
          </CardHeader>
          <CardContent class="space-y-4">
            {#each mockAchievements as ach}
              <div class="flex items-center gap-3">
                <div class="p-2 bg-primary/10 rounded-full text-primary">
                  <ach.icon class="w-4 h-4" />
                </div>
                <div>
                  <p class="text-sm font-medium leading-none">{ach.name}</p>
                  <p class="text-xs text-muted-foreground">{ach.desc}</p>
                </div>
              </div>
            {/each}
          </CardContent>
        </Card>
      </div>

      <div class="lg:col-span-8 space-y-6">
        
        <Card class="h-full">
          <CardHeader>
            <CardTitle class="flex items-center gap-2">
              <History class="w-5 h-5" /> Match History
            </CardTitle>
            <CardDescription>Recent games played across all modes.</CardDescription>
          </CardHeader>
          <CardContent class="p-0">
            <div class="flex flex-col divide-y">
              {#each games.filter(g => g.result !== 'abort') as game (game.gameId)}
                {@const eloDiff = game.userEloAfter - game.userEloBefore}
                <div class="flex items-center justify-between p-4 hover:bg-accent/40 transition-colors">
                  <div class="flex items-center gap-4">
                    <!-- TODO: currently the thing marks as green if white wins, regardless of the user's side -->
                    <!-- meaning we aren't actually marking if the user won or not. -->
                    <div class={`w-1 h-12 rounded-full ${game.result === 'white_win' ? 'bg-green-500' : game.result === 'draw' ? 'bg-gray-400' : 'bg-red-500'}`}></div>
                    <div>
                      <div class="flex items-center gap-2">
                         <span class="font-bold">{game.result === 'white_win' ? 'Won' : game.result === 'black_win' ? 'Lost' : 'Draw'}</span>
                         <span class="text-xs text-muted-foreground">vs {game.opponentUsername}</span>
                      </div>
                      <p class="text-sm text-muted-foreground">Normal • {formatCompactDuration(game.startedAt, game.endedAt)}</p>
                    </div>
                  </div>

                  <div class="text-right">
                    <span class={`text-sm font-bold ${eloDiff > 0 ? 'text-green-600' : eloDiff < 0 ? 'text-red-600' : 'text-gray-500'}`}>
                      {#if eloDiff < 0}-{/if}{eloDiff}
                    </span>
                    <p class="text-xs text-muted-foreground">{game.endedAt}</p>
                  </div>
                </div>
              {/each}
            </div>
          </CardContent>
        </Card>

      </div>
    </div>

  {:catch error}
    <div class="container mx-auto p-4 flex justify-center">
      <Card class="w-full max-w-md border-destructive/50 bg-destructive/5">
        <CardHeader>
          <div class="flex items-center gap-2 text-destructive font-bold">
            <TriangleAlert class="h-5 w-5" />
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
