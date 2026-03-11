<script lang="ts">
import { ClockIcon, TargetIcon, XIcon, ZapIcon } from "@lucide/svelte";
import { Button } from "@transc/ui/button";
import { Spinner } from "@transc/ui/spinner";
import { onDestroy, onMount } from "svelte";
import { goto } from "$app/navigation";
import { m } from "$lib/paraglide/messages";
import { gameState } from "$lib/stores/game.store";
import {
  joinQueue,
  leaveQueue,
  matchmakingState,
} from "$lib/stores/matchmaking.store";
import { socketConnected } from "$lib/stores/socket.svelte";

onMount(() => {
  return gameState.subscribe((state) => {
    if (
      state.gameId &&
      !state.gameOver &&
      !state.isSpectator &&
      !state.isBotGame
    ) {
      goto(`/game/${state.gameId}`);
    }
  });
});

onDestroy(() => {
  const state = $matchmakingState;
  if (state.inQueue && state.mode) {
    console.log("[Play] Leaving queue on page unload");
    leaveQueue(state.mode);
  }
});

function handleCancelQueue() {
  const state = $matchmakingState;
  if (state.mode) {
    leaveQueue(state.mode);
  }
}

const resolveModeTranslation = (mode: string | null) => {
  if (!mode) return "";
  switch (mode) {
    case "blitz":
      return m.play_page_mode_blitz();
    case "rapid":
      return m.play_page_mode_rapid();
    case "casual":
      return m.play_page_mode_casual();
  }
};

function playVsBot() {
  goto("/play/bot");
}
</script>

<main class="h-full flex items-center justify-center p-6">
  {#if !$socketConnected}
    <div class="text-center space-y-3">
      <Spinner class="w-8 h-8 mx-auto text-muted-foreground" />
      <p class="text-muted-foreground">{m.play_page_connecting()}</p>
    </div>
  {:else if $matchmakingState.inQueue}
    <!-- In queue -->
    <div class="text-center space-y-6 max-w-md">
      <Spinner class="w-12 h-12 mx-auto text-primary" />
      <div class="space-y-2">
        <h2 class="text-xl font-semibold">{m.play_page_inqueue_title()}</h2>
        <p class="text-muted-foreground">
          {m.play_page_inqueue_mode()}
          <span class="font-medium text-foreground"
            >{resolveModeTranslation($matchmakingState.mode)}</span
          >
        </p>
        {#if $matchmakingState.position}
          <p class="text-sm text-muted-foreground">
            {m.play_page_inqueue_position_title()}
            {$matchmakingState.position}
          </p>
        {/if}
      </div>
      <Button variant="outline" onclick={handleCancelQueue}>
        <XIcon class="w-4 h-4 mr-2" />
        {m.play_page_inqueue_button_cancel()}
      </Button>
    </div>
  {:else}
    <!-- Mode selection -->
    <div class="space-y-8 max-w-2xl w-full">
      <div class="text-center space-y-2">
        <h1 class="text-3xl font-bold">{m.play_page_gameselect_title()}</h1>
        <p class="text-muted-foreground">
          {m.play_page_gameselect_description()}
        </p>
      </div>

      <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <button
          class="flex flex-col items-center gap-3 p-6 border-2 rounded-xl hover:border-primary hover:bg-primary/5 transition-all"
          onclick={() => joinQueue('blitz')}
        >
          <ZapIcon class="w-10 h-10 text-amber-500" />
          <div class="text-center">
            <h3 class="font-semibold text-lg">{m.play_page_mode_blitz()}</h3>
            <p class="text-sm text-muted-foreground">
              {m.play_page_minutes_and_increment({ minutes: 5, increment: 2 })}
            </p>
          </div>
        </button>

        <button
          class="flex flex-col items-center gap-3 p-6 border-2 rounded-xl hover:border-primary hover:bg-primary/5 transition-all"
          onclick={() => joinQueue('rapid')}
        >
          <ClockIcon class="w-10 h-10 text-blue-500" />
          <div class="text-center">
            <h3 class="font-semibold text-lg">{m.play_page_mode_rapid()}</h3>
            <p class="text-sm text-muted-foreground">
              {m.play_page_minutes_and_increment({ minutes: 15, increment: 10 })}
            </p>
          </div>
        </button>

        <button
          class="flex flex-col items-center gap-3 p-6 border-2 rounded-xl hover:border-primary hover:bg-primary/5 transition-all"
          onclick={() => joinQueue('casual')}
        >
          <TargetIcon class="w-10 h-10 text-green-500" />
          <div class="text-center">
            <h3 class="font-semibold text-lg">{m.play_page_mode_casual()}</h3>
            <p class="text-sm text-muted-foreground">
              {m.play_page_minutes_and_increment({ minutes: 10, increment: 5 })}
            </p>
          </div>
        </button>

        <button
          class="flex flex-col items-center gap-3 p-6 border-2 rounded-xl hover:border-primary hover:bg-primary/5 transition-all"
          onclick={playVsBot}
        >
          <TargetIcon class="w-10 h-10 text-purple-500" />
          <div class="text-center">
            <h3 class="font-semibold text-lg">{m.play_page_mode_bot()}</h3>
            <p class="text-sm text-muted-foreground">
              {m.play_page_minutes_and_increment({minutes: 10, increment: 5})}
              <br>
              {m.play_page_mode_bot_unranked()}</p>
          </div>
        </button>
      </div>
    </div>
  {/if}
</main>
