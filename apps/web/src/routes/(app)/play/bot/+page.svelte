<script lang="ts">
import { BotIcon } from "@lucide/svelte";
import { Button } from "@transc/ui/button";
import { goto } from "$app/navigation";
import { gameState } from "$lib/stores/game.store";
import { socketManager } from "$lib/stores/socket.svelte";
import { m } from "$lib/paraglide/messages";

let isStarting = $state(false);

function startBotGame(difficulty: string) {
  isStarting = true;
  socketManager.emit("bot:start", { difficulty });
}

socketManager.on("game:state", ((data: {
  gameId: string;
  myColor?: "white" | "black";
  isBotGame?: boolean;
}) => {
  if (data.gameId && isStarting) {
    gameState.update((state) => ({ ...state, isBotGame: true }));
    goto(`/game/${data.gameId}`);
  }
}) as unknown as (...args: unknown[]) => void);
</script>

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
        disabled={isStarting}
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
        disabled={isStarting}
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
        disabled={isStarting}
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
