<script lang="ts">
import { ChartPieIcon } from "@lucide/svelte";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@transc/ui/card";
import type { UserStats } from "$lib/server/db-services";

const { stats }: { stats: UserStats } = $props();
</script>

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
        <div style="flex: {stats.wins}" class="bg-emerald-500 h-full"></div>
        <div style="flex: {stats.draws}" class="bg-slate-400 h-full"></div>
        <div style="flex: {stats.losses}" class="bg-rose-500 h-full"></div>
      </div>
      <div class="flex w-full text-sm font-medium">
        {#if stats.wins > 0}
          <span style="flex: {stats.wins}" class="text-center text-emerald-600"
            >{stats.wins} W</span
          >
        {/if}
        {#if stats.draws > 0}
          <span style="flex: {stats.draws}" class="text-center text-slate-500"
            >{stats.draws} D</span
          >
        {/if}
        {#if stats.losses > 0}
          <span style="flex: {stats.losses}" class="text-center text-rose-600"
            >{stats.losses} L</span
          >
        {/if}
      </div>
    {/if}
  </CardContent>
</Card>
