<script lang="ts">
import { TrendingUpIcon } from "@lucide/svelte";
import { Card, CardContent, CardHeader, CardTitle } from "@transc/ui/card";
import * as m from "$lib/paraglide/messages";
import type { UserStats } from "$lib/server/db-services";

const { stats, peakElo }: { stats: UserStats; peakElo: number } = $props();
</script>

<Card
  class="flex flex-col h-full col-span-1 lg:col-span-3 shadow-sm hover:shadow-md transition-shadow"
>
  <CardHeader class="pb-2">
    <CardTitle class="flex items-center gap-2 text-base">
      <TrendingUpIcon class="w-5 h-5 text-primary" />
      {m.current_elo_card_title()}
    </CardTitle>
  </CardHeader>
  <CardContent class="flex-1 flex flex-col justify-evenly items-center px-1">
    <div class="flex flex-col items-center justify-center">
      <span
        class="text-xs text-muted-foreground uppercase font-bold tracking-wider mb-1"
        >{m.current_elo_card_peak_elo()}</span
      >
      <span class="text-4xl font-black text-primary">{peakElo}</span>
    </div>
    <div class="flex flex-col items-center justify-center">
      <span
        class="text-xs text-muted-foreground uppercase font-bold tracking-wider mb-1"
        >{m.current_elo_card_current_elo()}</span
      >
      <span class="text-4xl font-black text-primary">{stats.currentElo}</span>
    </div>
  </CardContent>
</Card>
