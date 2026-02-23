<script lang="ts">
import {
  BabyIcon,
  CookingPotIcon,
  MedalIcon,
  MirrorRoundIcon,
  MountainSnowIcon,
  TrophyIcon,
} from "@lucide/svelte";
import { Card, CardContent, CardHeader, CardTitle } from "@transc/ui/card";
import type { Component } from "svelte";
import type { Achievements } from "$lib/server/db-services";

const { achievements: oachs }: { achievements: Achievements } = $props();

type Ach = {
  id: keyof Omit<Achievements, "userId">;
  label: string;
  description: string;
  icon: Component;
};

const achs: Ach[] = [
  {
    id: "update_profile",
    label: "True Beauty",
    description: "Edit your player profile",
    icon: MirrorRoundIcon,
  },
  {
    id: "first_game",
    label: "Baby Steps",
    description: "Play your first game",
    icon: BabyIcon,
  },
  {
    id: "first_win",
    label: "For The Win!",
    description: "Win your first match",
    icon: MedalIcon,
  },
  {
    id: "five_wins",
    label: "Hold Up, They're Cooking",
    description: "Win five matches",
    icon: CookingPotIcon,
  },
  {
    id: "reach_high_elo",
    label: "Peak Performance",
    description: "Reach 2k ELO",
    icon: MountainSnowIcon,
  },
];
</script>

<Card
  class="flex flex-col h-full col-span-1 md:col-span-2 lg:col-span-5 shadow-sm hover:shadow-md transition-shadow"
>
  <CardHeader class="pb-2">
    <CardTitle class="flex items-center gap-2 text-base">
      <TrophyIcon class="w-5 h-5" /> Badges
    </CardTitle>
  </CardHeader>
  <CardContent class="flex-1 flex flex-col justify-center gap-3">
    {#each achs as {icon: Icon, description, label, id} (id)}
      <div class="flex items-center gap-3">
        <div
          class={`p-2 rounded-full bg-muted/40 text-muted-foreground/30 ${oachs[id] && "bg-primary/10 text-primary"}`}
        >
          <Icon class="w-4 h-4" />
        </div>
        <div class={`${!oachs[id] && "*:text-muted-foreground/50"}`}>
          <p class="text-sm font-semibold leading-none">{label}</p>
          <p class="text-xs text-muted-foreground mt-1">{description}</p>
        </div>
      </div>
    {/each}
  </CardContent>
</Card>
