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
import * as m from "$lib/paraglide/messages";
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
    label: m.badges_card_ach_label_update_profile(),
    description: m.badges_card_ach_desc_update_profile(),
    icon: MirrorRoundIcon,
  },
  {
    id: "first_game",
    label: m.badges_card_ach_label_first_game(),
    description: m.badges_card_ach_desc_first_game(),
    icon: BabyIcon,
  },
  {
    id: "first_win",
    label: m.badges_card_ach_label_first_win(),
    description: m.badges_card_ach_desc_first_win(),
    icon: MedalIcon,
  },
  {
    id: "five_wins",
    label: m.badges_card_ach_label_five_wins(),
    description: m.badges_card_ach_desc_five_wins(),
    icon: CookingPotIcon,
  },
  {
    id: "reach_high_elo",
    label: m.badges_card_ach_label_reach_high_elo(),
    description: m.badges_card_ach_desc_reach_high_elo(),
    icon: MountainSnowIcon,
  },
];
</script>

<Card
  class="flex flex-col h-full col-span-1 md:col-span-2 lg:col-span-5 shadow-sm hover:shadow-md transition-shadow"
>
  <CardHeader class="pb-2">
    <CardTitle class="flex items-center gap-2 text-base">
      <TrophyIcon class="w-5 h-5 text-primary" />
      {m.badges_card_title()}
    </CardTitle>
  </CardHeader>
  <CardContent class="flex-1 flex flex-col justify-center gap-3">
    {#each achs as { icon: Icon, description, label, id } (id)}
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
