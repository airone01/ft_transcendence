<script lang="ts">
import { ClockIcon, FlagIcon, HandshakeIcon } from "@lucide/svelte";
import { Button } from "@transc/ui/button";
import * as Dialog from "@transc/ui/dialog";
import { Separator } from "@transc/ui/separator";
import { page } from "$app/state";
import {
  acceptDraw,
  gameState,
  isMyTurn,
  leaveGame,
  type MoveRecord,
  offerDraw,
  resign,
} from "$lib/stores/game.store";
import { socketConnected } from "$lib/stores/socket.svelte";
import Board from "../../play/board.svelte";

let gameId: string = page.params.id ?? "0";

let resignDialogOpen = $state(false);

function confirmResign() {
  resignDialogOpen = false;
  resign();
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

<main class="h-full flex items-center justify-center p-2 sm:p-4 lg:p-6">
  <div
    class="w-full max-w-[1424px] flex flex-col md:flex-row items-stretch gap-3 lg:gap-6"
  >
    <!-- Left Panel: Game Info — hidden on mobile/tablet, shown on desktop -->
    <div
      class="hidden xl:flex w-72 shrink-0 flex-col border rounded-lg p-5 overflow-hidden"
    >
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
            <div
              class="w-3 h-3 rounded-full bg-white border border-zinc-300"
            ></div>
            <span class="font-medium text-sm">White</span>
          {:else}
            <div
              class="w-3 h-3 rounded-full bg-zinc-800 dark:bg-zinc-300"
            ></div>
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
          <div
            class="bg-amber-500/15 text-amber-700 dark:text-amber-400 text-xs font-medium px-3 py-1.5 rounded-md"
          >
            Check!
          </div>
        {/if}

        {#if $gameState.gameOver}
          <div
            class="bg-primary/15 text-primary text-sm font-medium px-3 py-2 rounded-md space-y-1"
          >
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
      {#if $gameState.isSpectator}
        <div class="mt-4 space-y-1">
          <span class="text-sm text-muted-foreground">Mode</span>
          <div class="flex items-center gap-2">
            <span class="font-medium text-sm">Spectator</span>
          </div>
          <span class="text-xs text-muted-foreground">Watch only</span>
        </div>
      {:else if $gameState.myColor}
        <!-- Code joueur existant -->
        <div class="mt-4 space-y-1">
          <span class="text-sm text-muted-foreground">You play</span>
          <div class="flex items-center gap-2">
            {#if $gameState.myColor === "white"}
              <div
                class="w-3 h-3 rounded-full bg-white border border-zinc-300"
              ></div>
              <span class="font-medium text-sm">White</span>
            {:else}
              <div
                class="w-3 h-3 rounded-full bg-zinc-800 dark:bg-zinc-300"
              ></div>
              <span class="font-medium text-sm">Black</span>
            {/if}
          </div>
        </div>
      {/if}

      <Separator class="my-4" />

      <!-- Controls -->
      <div class="space-y-2 mt-auto">
        {#if $gameState.isSpectator}
          <!-- Bouton pour quitter le spectate -->
          <Button
            variant="outline"
            class="w-full"
            onclick={() => {
            leaveGame();
            window.history.back();
          }}
          >
            Leave spectator mode
          </Button>
        {:else if !$gameState.gameOver}
          <!-- Code joueur existant - inchangé -->
          <Button
            variant="outline"
            class="w-full justify-start"
            onclick={handleOfferDraw}
          >
            <HandshakeIcon class="w-4 h-4 mr-2" />
            Offer draw
          </Button>
          <Button
            variant="outline"
            class="w-full justify-start bg-[#b58863] hover:bg-[#a07552] text-white border-[#a07552]"
            onclick={() => (resignDialogOpen = true)}
          >
            <FlagIcon class="w-4 h-4 mr-2" />
            Resign
          </Button>
        {:else}
          <!-- Code game over existant - inchangé -->
          <Button
            variant="outline"
            class="w-full"
            onclick={() => window.history.back()}
          >
            Back to lobby
          </Button>
        {/if}
      </div>
    </div>

    <!-- Center: Board + mobile status bar -->
    <div class="flex flex-col flex-1 min-w-64 xl:min-w-72 gap-3">
      <!-- Mobile/Tablet status bar -->
      <div class="flex xl:hidden items-center justify-between gap-2 flex-wrap">
        <div class="flex items-center gap-2">
          {#if !$socketConnected}
            <span class="text-xs text-destructive font-medium"
              >Disconnected</span
            >
          {:else if $gameState.gameOver}
            <span class="text-sm font-semibold text-primary">
              Game over —
              {#if $gameState.winner}
                Winner: {$gameState.winner}
              {:else}
                Draw
              {/if}
            </span>
          {:else if $gameState.check && !$gameState.isCheckmate}
            <span
              class="text-xs font-medium text-amber-600 dark:text-amber-400 bg-amber-500/15 px-2 py-1 rounded-md"
              >Check!</span
            >
          {:else if $isMyTurn}
            <span class="text-xs text-primary font-medium">Your turn</span>
          {:else}
            <span class="text-xs text-muted-foreground">Opponent's turn</span>
          {/if}
          {#if $gameState.myColor}
            <div
              class="flex items-center gap-1.5 text-xs text-muted-foreground"
            >
              <div
                class="w-2.5 h-2.5 rounded-full border {$gameState.myColor ===
                'white'
                  ? 'bg-white border-zinc-300'
                  : 'bg-zinc-800 dark:bg-zinc-300 border-transparent'}"
              ></div>
              {$gameState.myColor === "white" ? "White" : "Black"}
            </div>
          {/if}
        </div>

        <!-- Mobile controls -->
        {#if !$gameState.gameOver}
          <div class="flex gap-2">
            <Button size="sm" variant="outline" onclick={handleOfferDraw}>
              <HandshakeIcon class="w-3.5 h-3.5" />
              <span class="hidden sm:inline ml-1">Draw</span>
            </Button>
            <Button
              size="sm"
              variant="outline"
              class="bg-[#b58863] hover:bg-[#a07552] text-white border-[#a07552]"
              onclick={() => (resignDialogOpen = true)}
            >
              <FlagIcon class="w-3.5 h-3.5" />
              <span class="hidden sm:inline ml-1">Resign</span>
            </Button>
          </div>
        {:else}
          <Button
            size="sm"
            variant="outline"
            onclick={() => window.history.back()}
          >
            Back to lobby
          </Button>
        {/if}
      </div>

      <div class="aspect-square w-full">
        <Board {gameId} />
      </div>
    </div>

    <!-- Right Panel: History + Timers -->
    <div
      class="md:w-64 lg:w-72 md:shrink-0 flex flex-col border rounded-lg p-4 lg:p-5 overflow-hidden"
    >
      <!-- Header — only on desktop -->
      <h2 class="hidden md:block text-lg font-semibold mb-4">Move history</h2>

      <!-- Timers — always visible, at top on mobile -->
      <div class="grid grid-cols-2 gap-2 md:order-last md:mt-4">
        <div
          class="flex items-center gap-2 rounded-lg px-3 py-2.5 {whiteIsActive
            ? 'bg-[#b58863] text-white'
            : 'bg-zinc-800 dark:bg-zinc-900 text-white'}"
        >
          <div class="flex items-center gap-1.5">
            <div class="w-2 h-2 rounded-full bg-white"></div>
            <span class="text-xs font-medium">White</span>
          </div>
          <div class="flex items-center gap-1 ml-auto">
            <ClockIcon class="w-3.5 h-3.5 opacity-70" />
            <span
              class="text-sm font-mono font-semibold {whiteIsLow
                ? 'text-red-400'
                : ''}"
              >{whiteTime}</span
            >
          </div>
        </div>
        <div
          class="flex items-center gap-2 rounded-lg px-3 py-2.5 {blackIsActive
            ? 'bg-[#b58863] text-white'
            : 'bg-zinc-800 dark:bg-zinc-900 text-white'}"
        >
          <div class="flex items-center gap-1.5">
            <div class="w-2 h-2 rounded-full bg-zinc-400"></div>
            <span class="text-xs font-medium">Black</span>
          </div>
          <div class="flex items-center gap-1 ml-auto">
            <ClockIcon class="w-3.5 h-3.5 opacity-70" />
            <span
              class="text-sm font-mono font-semibold {blackIsLow
                ? 'text-red-400'
                : ''}"
              >{blackTime}</span
            >
          </div>
        </div>
      </div>

      <!-- Move history — collapsible on mobile, always shown on desktop -->
      <details class="mt-3 md:hidden" open>
        <summary class="text-sm font-semibold cursor-pointer select-none py-1">
          Move history
        </summary>
        <div class="max-h-40 overflow-y-auto rounded-lg bg-muted/50 mt-2">
          {#if movePairs().length === 0}
            <div class="flex items-center justify-center py-4">
              <span class="text-sm text-muted-foreground">No moves yet</span>
            </div>
          {:else}
            <div class="p-2 space-y-0.5">
              {#each movePairs() as [white, black], i}
                <div
                  class="grid grid-cols-[2rem_1fr_1fr] text-sm items-center gap-1 px-1 py-0.5 rounded hover:bg-muted"
                >
                  <span class="text-muted-foreground text-xs font-mono"
                    >{i + 1}.</span
                  >
                  <span class="font-mono"
                    >{white.from}-{white.to} {white.promotion ?? ""}
                    {white.checkmate ? "#" : white.check ? "+" : ""}</span
                  >
                  {#if black}
                    <span class="font-mono"
                      >{black.from}-{black.to} {black.promotion ?? ""}
                      {black.checkmate ? "#" : black.check ? "+" : ""}</span
                    >
                  {:else}
                    <span></span>
                  {/if}
                </div>
              {/each}
            </div>
          {/if}
        </div>
      </details>

      <!-- Move history desktop -->
      <div
        class="hidden md:flex flex-1 mt-0 rounded-lg bg-muted/50 overflow-y-auto min-h-0"
      >
        {#if movePairs().length === 0}
          <div class="h-full flex items-center justify-center w-full">
            <span class="text-sm text-muted-foreground">No moves yet</span>
          </div>
        {:else}
          <div class="p-2 space-y-0.5 w-full">
            {#each movePairs() as [white, black], i}
              <div
                class="grid grid-cols-[2rem_1fr_1fr] text-sm items-center gap-1 px-1 py-0.5 rounded hover:bg-muted"
              >
                <span class="text-muted-foreground text-xs font-mono"
                  >{i + 1}.</span
                >
                <span class="font-mono"
                  >{white.from}-{white.to}
                  {white.promotion ?? ""}
                  {white.checkmate
                    ? "#"
                    : white.check
                      ? "+"
                      : ""}</span
                >
                {#if black}
                  <span class="font-mono"
                    >{black.from}-{black.to}
                    {black.promotion ?? ""}
                    {black.checkmate
                      ? "#"
                      : black.check
                        ? "+"
                        : ""}</span
                  >
                {:else}
                  <span></span>
                {/if}
              </div>
            {/each}
          </div>
        {/if}
      </div>
    </div>
  </div>

  <!-- Draw offer dialog (shown to the recipient) -->
  <Dialog.Root open={$gameState.drawOffered && !$gameState.gameOver}>
    <Dialog.Content showCloseButton={false}>
      <Dialog.Header>
        <Dialog.Title>Draw offer</Dialog.Title>
        <Dialog.Description>
          Your opponent is offering a draw. Do you accept?
        </Dialog.Description>
      </Dialog.Header>
      <Dialog.Footer>
        <Button
          variant="outline"
          onclick={() => gameState.update((s) => ({ ...s, drawOffered: false }))}
        >
          Decline
        </Button>
        <Button onclick={acceptDraw}>
          <HandshakeIcon class="w-4 h-4 mr-2" />
          Accept
        </Button>
      </Dialog.Footer>
    </Dialog.Content>
  </Dialog.Root>

  <!-- Resign confirmation dialog -->
  <Dialog.Root bind:open={resignDialogOpen}>
    <Dialog.Content showCloseButton={false}>
      <Dialog.Header>
        <Dialog.Title>Resign the game?</Dialog.Title>
        <Dialog.Description>
          Your opponent will be declared the winner. This cannot be undone.
        </Dialog.Description>
      </Dialog.Header>
      <Dialog.Footer>
        <Dialog.Close>
          <Button variant="outline" class="w-full">Cancel</Button>
        </Dialog.Close>
        <Button
          class="bg-[#b58863] hover:bg-[#a07552] text-white border-[#a07552]"
          onclick={confirmResign}
        >
          <FlagIcon class="w-4 h-4 mr-2" />
          Resign
        </Button>
      </Dialog.Footer>
    </Dialog.Content>
  </Dialog.Root>

  <!-- Game Over dialog -->
  <Dialog.Root open={$gameState.gameOver}>
    <Dialog.Content showCloseButton={false} class="max-w-md">
      <Dialog.Header>
        <Dialog.Title class="text-2xl text-center">
          {#if $gameState.winner}
            {#if $gameState.winner === $gameState.myColor}
              Victory!
            {:else if $gameState.isSpectator}
              Game Over
            {:else}
              Defeat
            {/if}
          {:else}
            Draw
          {/if}
        </Dialog.Title>
        <Dialog.Description class="text-center space-y-2">
          {#if $gameState.winner}
            <p class="text-lg font-semibold">
              {$gameState.winnerName || $gameState.winner} wins!
            </p>
          {:else}
            <p class="text-lg font-semibold">Game drawn</p>
          {/if}
          {#if $gameState.reason}
            <p class="text-sm text-muted-foreground capitalize">
              {$gameState.reason === "timeout" ? "by timeout" : 
                   $gameState.reason === "checkmate" ? "by checkmate" :
                   $gameState.reason === "resignation" ? "by resignation" :
                   $gameState.reason === "agreement" ? "by agreement" :
                   $gameState.reason}
            </p>
          {/if}
        </Dialog.Description>
      </Dialog.Header>
      <Dialog.Footer class="flex gap-2">
        <Button
          variant="outline"
          class="flex-1"
          onclick={() => window.history.back()}
        >
          Back to lobby
        </Button>
      </Dialog.Footer>
    </Dialog.Content>
  </Dialog.Root>
</main>
