<script lang="ts">
import { ChartLineIcon } from "@lucide/svelte";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@transc/ui/card";
import { type ChartConfig, ChartContainer } from "@transc/ui/chart";
import { Empty } from "@transc/ui/command";
import {
  EmptyContent,
  EmptyDescription,
  EmptyMedia,
  EmptyTitle,
} from "@transc/ui/empty";
import { scaleUtc } from "d3-scale";
import { AreaChart } from "layerchart";

const chartConfig: ChartConfig = {
  elo: { label: "ELO", color: "var(--chart-1)" },
};

const { eloHistory }: { eloHistory: { date: Date; elo: number }[] } = $props();
</script>

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
