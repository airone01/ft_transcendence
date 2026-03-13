<script lang="ts">
import { ChartPieIcon, SnowflakeIcon } from "@lucide/svelte";
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
import type { UserStats } from "$lib/server/db-services";

const { stats }: { stats: UserStats } = $props();

// svelte-ignore state_referenced_locally idc, inital page load
if (stats.wins + stats.losses + stats.draws === 0) stats.gamesPlayed = 0; // edge case
</script>

<Card
  class="flex flex-col h-full col-span-1 lg:col-span-4 shadow-sm hover:shadow-md transition-shadow"
>
  <CardHeader class="pb-2">
    <CardTitle class="flex items-center gap-2 text-base">
      <ChartPieIcon class="w-5 h-5 text-primary" />
      {m.win_ratio_card_title()}
    </CardTitle>
    <CardDescription>
      {#if stats.gamesPlayed === 0}
        {m.win_ratio_card_empty_description()}
      {:else}
        {m.win_ratio_card_description()}: {stats.gamesPlayed}
      {/if}
    </CardDescription>
  </CardHeader>
  <CardContent class="flex-1 flex flex-col justify-center">
    {#if stats.gamesPlayed === 0}
      <Empty>
        <EmptyHeader>
          <EmptyMedia variant="icon">
            <SnowflakeIcon />
          </EmptyMedia>
          <EmptyTitle>{m.win_ratio_card_empty_title()}</EmptyTitle>
          <EmptyDescription>
            {m.win_ratio_card_empty_description()}
          </EmptyDescription>
        </EmptyHeader>
      </Empty>
    {:else}
      <div
        class="flex h-5 w-full rounded-full overflow-hidden mb-3 shadow-inner"
      >
        <div style="flex: {stats.wins}" class="bg-emerald-500 h-full"></div>
        <div style="flex: {stats.draws}" class="bg-slate-400 h-full"></div>
        <div style="flex: {stats.losses}" class="bg-rose-500 h-full"></div>
      </div>
      <div class="flex w-full text-sm font-medium">
        {#if stats.wins > 0}
          <span style="flex: {stats.wins}" class="text-center text-emerald-700"
            >{stats.wins}
            {m.win_ratio_card_wins()}</span
          >
        {/if}
        {#if stats.draws > 0}
          <span style="flex: {stats.draws}" class="text-center text-slate-600"
            >{stats.draws}
            {m.win_ratio_card_draws()}</span
          >
        {/if}
        {#if stats.losses > 0}
          <span style="flex: {stats.losses}" class="text-center text-rose-700"
            >{stats.losses}
            {m.win_ratio_card_losses()}</span
          >
        {/if}
      </div>
    {/if}
  </CardContent>
</Card>
