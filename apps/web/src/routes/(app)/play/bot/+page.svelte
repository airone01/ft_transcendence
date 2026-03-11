<script lang="ts">
import { BotIcon } from "@lucide/svelte";
import { Button } from "@transc/ui/button";
import { Spinner } from "@transc/ui/spinner";
import { goto } from "$app/navigation";
import { gameState } from "$lib/stores/game.store";
import { socketManager } from "$lib/stores/socket.svelte";
import { onMount, onDestroy } from "svelte";

let isStarting = $state(false);
let queuePosition = $state<number | null>(null);
let queueInfo = $state<{ activeGames: number; maxGames: number } | null>(null);

const handleGameState = (data: {
  gameId: string;
  myColor?: "white" | "black";
  isBotGame?: boolean;
}) => {
  console.log("[Bot Client] Received game:state", data);
  if (data.gameId && data.isBotGame && isStarting) {
    console.log("[Bot Client] Redirecting to game");
    gameState.update((state) => ({ ...state, isBotGame: true }));
    goto(`/game/${data.gameId}`);
  }
};

const handleQueue = (data: { position: number; activeGames: number; maxGames: number }) => {
  console.log("[Bot Client] Received bot:queue", data);
  queuePosition = data.position;
  queueInfo = { activeGames: data.activeGames, maxGames: data.maxGames };
};

const handleQueueLeft = () => {
  console.log("[Bot Client] Received bot:queue_left");
  isStarting = false;
  queuePosition = null;
  queueInfo = null;
};

onMount(() => {
  console.log("[Bot Client] Installing listeners");
  
  socketManager.on("game:state", handleGameState as unknown as (...args: unknown[]) => void);
  socketManager.on("bot:queue", handleQueue as unknown as (...args: unknown[]) => void);
  socketManager.on("bot:queue_left", handleQueueLeft as unknown as (...args: unknown[]) => void);

  return () => {
    console.log("[Bot Client] Removing listeners");
    socketManager.off("game:state", handleGameState as unknown as (...args: unknown[]) => void);
    socketManager.off("bot:queue", handleQueue as unknown as (...args: unknown[]) => void);
    socketManager.off("bot:queue_left", handleQueueLeft as unknown as (...args: unknown[]) => void);
  };
});

onDestroy(() => {
  if (isStarting || queuePosition !== null) {
    console.log("[Bot Client] Page unmounted, leaving queue");
    socketManager.emit("bot:cancel");
  }
});

function startBotGame(difficulty: string) {
  if (isStarting) return;
  isStarting = true;
  queuePosition = null;
  queueInfo = null;
  
  console.log("[Bot Client] Emitting bot:start with difficulty:", difficulty);
  socketManager.emit("bot:start", { difficulty });
}

function cancelQueue() {
  console.log("[Bot Client] Cancelling queue");
  socketManager.emit("bot:cancel");
  isStarting = false;
  queuePosition = null;
  queueInfo = null;
}
</script>

{#if queuePosition !== null || isStarting}
  <main class="h-full flex flex-col items-center justify-center gap-8 p-6">
    <Spinner class="w-16 h-16" />
    
    <div class="text-center space-y-3">
      <h2 class="text-2xl font-semibold">
        {#if queuePosition !== null}
          Waiting for bot game...
        {:else}
          Starting bot game...
        {/if}
      </h2>
      
      {#if queuePosition !== null}
        <p class="text-muted-foreground">Queue position: {queuePosition}</p>
        {#if queueInfo}
          <p class="text-sm text-muted-foreground">
            {queueInfo.activeGames}/{queueInfo.maxGames} bot games currently running
          </p>
        {/if}
      {/if}
    </div>

    <Button variant="outline" onclick={cancelQueue}>
      Cancel
    </Button>
  </main>
{:else}
  <main class="h-full flex items-center justify-center p-6">
    <div class="space-y-8 max-w-2xl w-full">
      <div class="text-center space-y-2">
        <div class="flex items-center justify-center gap-3 mb-4">
          <BotIcon class="w-12 h-12 text-purple-500" />
          <h1 class="text-3xl font-bold">Play vs Bot</h1>
        </div>
        <p class="text-muted-foreground">
          Practice your chess skills against the computer
        </p>
      </div>

      <div class="grid grid-cols-1 gap-4 max-w-md mx-auto">
        <Button
          size="lg"
          variant="outline"
          class="h-20 text-lg"
          onclick={() => startBotGame('easy')}
        >
          <div class="flex flex-col items-center gap-1">
            <span class="font-semibold">Easy</span>
            <span class="text-xs text-muted-foreground">Good for beginners</span>
          </div>
        </Button>

        <Button
          size="lg"
          variant="outline"
          class="h-20 text-lg"
          onclick={() => startBotGame('medium')}
        >
          <div class="flex flex-col items-center gap-1">
            <span class="font-semibold">Medium</span>
            <span class="text-xs text-muted-foreground">Balanced challenge</span>
          </div>
        </Button>

        <Button
          size="lg"
          variant="outline"
          class="h-20 text-lg"
          onclick={() => startBotGame('hard')}
        >
          <div class="flex flex-col items-center gap-1">
            <span class="font-semibold">Hard</span>
            <span class="text-xs text-muted-foreground">For experienced players</span>
          </div>
        </Button>
      </div>

      <div class="text-center">
        <Button variant="ghost" onclick={() => goto('/play')}>
          Back to game modes
        </Button>
      </div>
    </div>
  </main>
{/if}