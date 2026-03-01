<script lang="ts">
import { ClockIcon, TargetIcon, XIcon, ZapIcon } from "@lucide/svelte";
import { Button } from "@transc/ui/button";
import { Spinner } from "@transc/ui/spinner";
import {
  joinQueue,
  leaveQueue,
  matchmakingState,
} from "$lib/stores/matchmaking.store";
import { socketConnected } from "$lib/stores/socket.svelte";
import { gameState } from "$lib/stores/game.store";
import { goto } from "$app/navigation";
import { onMount } from "svelte";

onMount(() => {
  return gameState.subscribe((state) => {
    if (state.gameId && !state.gameOver) {
      goto(`/game/${state.gameId}`);
    }
  });
});

function handleCancelQueue() {
  const state = $matchmakingState;
  if (state.mode) {
    leaveQueue(state.mode);
  }
}
</script>

<main class="h-full flex items-center justify-center p-6">
  {#if !$socketConnected}
    <div class="text-center space-y-3">
      <Spinner class="w-8 h-8 mx-auto text-muted-foreground" />
      <p class="text-muted-foreground">Connecting to server...</p>
    </div>
  {:else if $matchmakingState.inQueue}
    <!-- In queue -->
    <div class="text-center space-y-6 max-w-md">
      <Spinner class="w-12 h-12 mx-auto text-primary" />
      <div class="space-y-2">
        <h2 class="text-xl font-semibold">Looking for an opponent...</h2>
        <p class="text-muted-foreground">
          Mode: <span class="font-medium text-foreground">{$matchmakingState.mode}</span>
        </p>
        {#if $matchmakingState.position}
          <p class="text-sm text-muted-foreground">
            Queue position: {$matchmakingState.position}
          </p>
        {/if}
      </div>
      <Button variant="outline" onclick={handleCancelQueue}>
        <XIcon class="w-4 h-4 mr-2" />
        Cancel
      </Button>
    </div>
  {:else}
    <!-- Mode selection -->
    <div class="space-y-8 max-w-2xl w-full">
      <div class="text-center space-y-2">
        <h1 class="text-3xl font-bold">Play a game</h1>
        <p class="text-muted-foreground">Choose your game mode</p>
      </div>

      <div class="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <button
          class="flex flex-col items-center gap-3 p-6 border-2 rounded-xl hover:border-primary hover:bg-primary/5 transition-all cursor-pointer"
          onclick={() => joinQueue('blitz')}
        >
          <ZapIcon class="w-10 h-10 text-amber-500" />
          <div class="text-center">
            <h3 class="font-semibold text-lg">Blitz</h3>
            <p class="text-sm text-muted-foreground">5 min + 2s/move</p>
          </div>
        </button>

        <button
          class="flex flex-col items-center gap-3 p-6 border-2 rounded-xl hover:border-primary hover:bg-primary/5 transition-all cursor-pointer"
          onclick={() => joinQueue('rapid')}
        >
          <ClockIcon class="w-10 h-10 text-blue-500" />
          <div class="text-center">
            <h3 class="font-semibold text-lg">Rapid</h3>
            <p class="text-sm text-muted-foreground">15 min + 10s/move</p>
          </div>
        </button>

        <button
          class="flex flex-col items-center gap-3 p-6 border-2 rounded-xl hover:border-primary hover:bg-primary/5 transition-all cursor-pointer"
          onclick={() => joinQueue('casual')}
        >
          <TargetIcon class="w-10 h-10 text-green-500" />
          <div class="text-center">
            <h3 class="font-semibold text-lg">Casual</h3>
            <p class="text-sm text-muted-foreground">10 min + 5s/move</p>
          </div>
        </button>
      </div>
    </div>
  {/if}
</main>
