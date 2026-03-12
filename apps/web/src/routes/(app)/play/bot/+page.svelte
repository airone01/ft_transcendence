<script lang="ts">
import { BotIcon } from "@lucide/svelte";
import { Button } from "@transc/ui/button";
import { Spinner } from "@transc/ui/spinner";
import { onDestroy, onMount } from "svelte";
import { goto } from "$app/navigation";
import { m } from "$lib/paraglide/messages";
import { gameState } from "$lib/stores/game.store";
import { socketManager } from "$lib/stores/socket.svelte";

let isWaiting = $state(false);

const handleGameState = (data: { gameId: string; isBotGame?: boolean }) => {
  if (data.gameId && data.isBotGame) {
    gameState.update((state) => ({ ...state, isBotGame: true }));
    goto(`/game/${data.gameId}`);
  }
};

const handleWaiting = () => {
  isWaiting = true;
};

const handleCancelled = () => {
  isWaiting = false;
};

onMount(() => {
  socketManager.on(
    "game:state",
    handleGameState as unknown as (...args: unknown[]) => void,
  );
  socketManager.on(
    "bot:waiting",
    handleWaiting as unknown as (...args: unknown[]) => void,
  );
  socketManager.on(
    "bot:cancelled",
    handleCancelled as unknown as (...args: unknown[]) => void,
  );

  return () => {
    socketManager.off(
      "game:state",
      handleGameState as unknown as (...args: unknown[]) => void,
    );
    socketManager.off(
      "bot:waiting",
      handleWaiting as unknown as (...args: unknown[]) => void,
    );
    socketManager.off(
      "bot:cancelled",
      handleCancelled as unknown as (...args: unknown[]) => void,
    );
  };
});

onDestroy(() => {
  if (isWaiting) {
    socketManager.emit("bot:cancel");
  }
});

function startBotGame(difficulty: string) {
  socketManager.emit("bot:start", { difficulty });
}

function cancelQueue() {
  socketManager.emit("bot:cancel");
  isWaiting = false;
}
</script>

{#if isWaiting}
  <main class="h-full flex flex-col items-center justify-center gap-8 p-6">
    <Spinner class="w-16 h-16" />
    <div class="text-center space-y-3">
      <h2 class="text-2xl font-semibold">
        {m.play_page_mode_bot_queue_title()}
      </h2>
      <p class="text-sm text-muted-foreground">
        {m.play_page_mode_bot_queue_description()}
      </p>
    </div>
    <Button variant="outline" onclick={cancelQueue}>
      {m.play_page_mode_bot_queue_button_cancel()}
    </Button>
  </main>
{:else}
  <main class="h-full flex items-center justify-center p-6">
    <div class="space-y-8 max-w-2xl w-full">
      <div class="text-center space-y-2">
        <div class="flex items-center justify-center gap-3 mb-4">
          <BotIcon class="w-12 h-12 text-purple-500" />
          <h1 class="text-3xl font-bold">{m.play_page_mode_bot()}</h1>
        </div>
        <p class="text-muted-foreground">
          {m.play_page_mode_bot_description()}
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
            <span class="font-semibold">{m.play_page_mode_bot_easy()}</span>
          </div>
        </Button>

        <Button
          size="lg"
          variant="outline"
          class="h-20 text-lg"
          onclick={() => startBotGame('medium')}
        >
          <div class="flex flex-col items-center gap-1">
            <span class="font-semibold">{m.play_page_mode_bot_medium()}</span>
          </div>
        </Button>

        <Button
          size="lg"
          variant="outline"
          class="h-20 text-lg"
          onclick={() => startBotGame('hard')}
        >
          <div class="flex flex-col items-center gap-1">
            <span class="font-semibold">{m.play_page_mode_bot_hard()}</span>
          </div>
        </Button>
      </div>

      <div class="text-center">
        <Button variant="ghost" onclick={() => goto('/play')}>
          {m.play_page_mode_bot_button_back()}
        </Button>
      </div>
    </div>
  </main>
{/if}
