<script lang="ts">
import { BotIcon } from "@lucide/svelte";
import { Button } from "@transc/ui/button";
import { goto } from "$app/navigation";
import { socketManager } from "$lib/stores/socket.svelte";
import { gameState } from "$lib/stores/game.store";

let isStarting = $state(false);

function startBotGame(difficulty: string) {
  isStarting = true;
  socketManager.emit("bot:start", { difficulty });
}

socketManager.on("game:state", ((data: any) => {
  if (data.gameId && isStarting) {
    gameState.update(state => ({ ...state, isBotGame: true }));
    goto(`/game/${data.gameId}`);
  }
}) as unknown as (...args: unknown[]) => void);
</script>

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
        disabled={isStarting}
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
        disabled={isStarting}
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
        disabled={isStarting}
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