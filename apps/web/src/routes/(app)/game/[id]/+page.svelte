<script lang="ts">
import { page } from "$app/state";
import { RotateCcwIcon, ClockIcon, FlagIcon, HandshakeIcon } from "@lucide/svelte";
import { Button } from "@transc/ui/button";
import { Separator } from "@transc/ui/separator";
import { gameState, isMyTurn, resign, offerDraw, type MoveRecord } from "$lib/stores/game.store";
import { socketConnected } from "$lib/stores/socket.svelte";
import Board from "../../play/board.svelte";

const gameId = page.params.id!;

function handleResign() {
  if (confirm("Resign the game?")) {
    resign();
  }
}

function handleOfferDraw() {
  if ($gameState.gameOver) return;
  offerDraw();
}

function formatTime(ms: number): string {
  const totalSeconds = Math.max(0, Math.floor(ms / 1000));
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = totalSeconds % 60;
  return `${minutes}:${String(seconds).padStart(2, "0")}`;
}

const whiteTime = $derived(formatTime($gameState.whiteTimeLeft));
const blackTime = $derived(formatTime($gameState.blackTimeLeft));
const whiteIsLow = $derived($gameState.whiteTimeLeft < 30_000);
const blackIsLow = $derived($gameState.blackTimeLeft < 30_000);
const whiteIsActive = $derived($gameState.turn === "w" && !$gameState.gameOver);
const blackIsActive = $derived($gameState.turn === "b" && !$gameState.gameOver);

// Group moves by pairs: [[white, black?], ...]
const movePairs = $derived(() => {
  const pairs: [MoveRecord, MoveRecord | null][] = [];
  const moves = $gameState.moves;
  for (let i = 0; i < moves.length; i += 2) {
    pairs.push([moves[i], moves[i + 1] ?? null]);
  }
  return pairs;
});
</script>

<main class="h-full flex items-center justify-center p-6">
  <div class="w-full max-w-[1424px] flex items-stretch gap-6">
  <!-- Left Panel: Game Info -->
  <div class="w-72 shrink-0 flex flex-col border rounded-lg p-5 overflow-hidden">
    <!-- Header -->
    <div class="flex items-center justify-between">
      <h2 class="text-lg font-semibold">Current game</h2>
      {#if !$socketConnected}
        <span class="text-xs text-destructive">Disconnected</span>
      {/if}
    </div>

    <Separator class="my-4" />

    <!-- Current turn -->
    <div class="space-y-1">
      <span class="text-sm text-muted-foreground">Current turn</span>
      <div class="flex items-center gap-2">
        {#if $gameState.turn === "w"}
          <div class="w-3 h-3 rounded-full bg-white border border-zinc-300"></div>
          <span class="font-medium text-sm">White</span>
        {:else}
          <div class="w-3 h-3 rounded-full bg-zinc-800 dark:bg-zinc-300"></div>
          <span class="font-medium text-sm">Black</span>
        {/if}
      </div>
      {#if $isMyTurn}
        <span class="text-xs text-primary font-medium">Your turn</span>
      {:else if !$gameState.gameOver}
        <span class="text-xs text-muted-foreground">Opponent's turn</span>
      {/if}
    </div>

    <Separator class="my-4" />

    <!-- Status -->
    <div class="space-y-2">
      {#if $gameState.check && !$gameState.isCheckmate}
        <div class="bg-amber-500/15 text-amber-700 dark:text-amber-400 text-xs font-medium px-3 py-1.5 rounded-md">
          Check!
        </div>
      {/if}

      {#if $gameState.gameOver}
        <div class="bg-primary/15 text-primary text-sm font-medium px-3 py-2 rounded-md space-y-1">
          <p class="font-semibold">Game over</p>
          {#if $gameState.winner}
            <p>Winner: {$gameState.winner}</p>
          {:else}
            <p>Draw</p>
          {/if}
          {#if $gameState.reason}
            <p class="text-xs opacity-75">{$gameState.reason}</p>
          {/if}
        </div>
      {/if}
    </div>

    <!-- My color -->
    {#if $gameState.myColor}
      <div class="mt-4 space-y-1">
        <span class="text-sm text-muted-foreground">You play</span>
        <div class="flex items-center gap-2">
          {#if $gameState.myColor === "white"}
            <div class="w-3 h-3 rounded-full bg-white border border-zinc-300"></div>
            <span class="font-medium text-sm">White</span>
          {:else}
            <div class="w-3 h-3 rounded-full bg-zinc-800 dark:bg-zinc-300"></div>
            <span class="font-medium text-sm">Black</span>
          {/if}
        </div>
      </div>
    {/if}

    <Separator class="my-4" />

    <!-- Controls -->
    <div class="space-y-2 mt-auto">
      {#if !$gameState.gameOver}
        <Button variant="outline" class="w-full justify-start" onclick={handleOfferDraw}>
          <HandshakeIcon class="w-4 h-4 mr-2" />
          Offer draw
        </Button>
        <Button variant="outline" class="w-full justify-start bg-[#b58863] hover:bg-[#a07552] text-white border-[#a07552]" onclick={handleResign}>
          <FlagIcon class="w-4 h-4 mr-2" />
          Resign
        </Button>
      {:else}
        <Button variant="outline" class="w-full" onclick={() => window.history.back()}>
          Back to lobby
        </Button>
      {/if}
    </div>
  </div>

  <!-- Center: Board -->
  <div class="flex-1 max-w-[800px] min-w-[400px]">
    <Board {gameId} />
  </div>

  <!-- Right Panel: History -->
  <div class="w-72 shrink-0 flex flex-col border rounded-lg p-5 overflow-hidden">
    <!-- Header -->
    <h2 class="text-lg font-semibold">Move history</h2>

    <!-- Move history -->
    <div class="flex-1 mt-4 rounded-lg bg-muted/50 overflow-y-auto min-h-0">
      {#if movePairs().length === 0}
        <div class="h-full flex items-center justify-center">
          <span class="text-sm text-muted-foreground">No moves yet</span>
        </div>
      {:else}
        <div class="p-2 space-y-0.5">
          {#each movePairs() as [white, black], i}
            <div class="grid grid-cols-[2rem_1fr_1fr] text-sm items-center gap-1 px-1 py-0.5 rounded hover:bg-muted">
              <span class="text-muted-foreground text-xs font-mono">{i + 1}.</span>
              <span class="font-mono">{white.from}-{white.to}{white.promotion ?? ''}{white.checkmate ? '#' : white.check ? '+' : ''}</span>
              {#if black}
                <span class="font-mono">{black.from}-{black.to}{black.promotion ?? ''}{black.checkmate ? '#' : black.check ? '+' : ''}</span>
              {:else}
                <span></span>
              {/if}
            </div>
          {/each}
        </div>
      {/if}
    </div>

    <!-- Timers -->
    <div class="grid grid-cols-2 gap-2 mt-4">
      <div class="flex items-center gap-2 rounded-lg px-3 py-2.5 {whiteIsActive ? 'bg-[#b58863] text-white' : 'bg-zinc-800 dark:bg-zinc-900 text-white'}">
        <div class="flex items-center gap-1.5">
          <div class="w-2 h-2 rounded-full bg-white"></div>
          <span class="text-xs font-medium">White</span>
        </div>
        <div class="flex items-center gap-1 ml-auto">
          <ClockIcon class="w-3.5 h-3.5 opacity-70" />
          <span class="text-sm font-mono font-semibold {whiteIsLow ? 'text-red-400' : ''}">{whiteTime}</span>
        </div>
      </div>
      <div class="flex items-center gap-2 rounded-lg px-3 py-2.5 {blackIsActive ? 'bg-[#b58863] text-white' : 'bg-zinc-800 dark:bg-zinc-900 text-white'}">
        <div class="flex items-center gap-1.5">
          <div class="w-2 h-2 rounded-full bg-zinc-400"></div>
          <span class="text-xs font-medium">Black</span>
        </div>
        <div class="flex items-center gap-1 ml-auto">
          <ClockIcon class="w-3.5 h-3.5 opacity-70" />
          <span class="text-sm font-mono font-semibold {blackIsLow ? 'text-red-400' : ''}">{blackTime}</span>
        </div>
      </div>
    </div>
  </div>
  </div>
</main>
