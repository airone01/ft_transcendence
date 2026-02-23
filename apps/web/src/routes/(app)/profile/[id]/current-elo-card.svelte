<script lang="ts">
import { TrendingUpIcon } from "@lucide/svelte";
import { Card, CardContent, CardHeader, CardTitle } from "@transc/ui/card";
import type { UserStats } from "$lib/server/db-services";

const { stats }: { stats: UserStats } = $props();
</script>

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
      <span class="text-4xl font-black text-primary">{stats.currentElo}</span>
    </div>
  </CardContent>
</Card>
