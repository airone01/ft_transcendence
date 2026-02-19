<script lang="ts">
import { page } from "$app/state";
import { RotateCcwIcon, ClockIcon, FlagIcon, HandshakeIcon } from "@lucide/svelte";
import { Button } from "@transc/ui/button";
import { Separator } from "@transc/ui/separator";
import { gameState, isMyTurn, resign, offerDraw } from "$lib/stores/game.store";
import { socketConnected } from "$lib/stores/socket.svelte";
import Board from "../../play/board.svelte";

const gameId = page.params.id!;

function handleResign() {
  if (confirm("Abandonner la partie ?")) {
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
</script>

<main class="h-full flex items-center justify-center gap-6 p-6">
  <!-- Left Panel: Partie en cours -->
  <div class="w-72 shrink-0 h-[800px] flex flex-col border rounded-lg p-5">
    <!-- Header -->
    <div class="flex items-center justify-between">
      <h2 class="text-lg font-semibold">Partie en cours</h2>
      {#if !$socketConnected}
        <span class="text-xs text-destructive">Deconnecte</span>
      {/if}
    </div>

    <Separator class="my-4" />

    <!-- Tour actuel -->
    <div class="space-y-1">
      <span class="text-sm text-muted-foreground">Tour actuel</span>
      <div class="flex items-center gap-2">
        {#if $gameState.turn === "w"}
          <div class="w-3 h-3 rounded-full bg-white border border-zinc-300"></div>
          <span class="font-medium text-sm">Blancs</span>
        {:else}
          <div class="w-3 h-3 rounded-full bg-zinc-800 dark:bg-zinc-300"></div>
          <span class="font-medium text-sm">Noirs</span>
        {/if}
      </div>
      {#if $isMyTurn}
        <span class="text-xs text-primary font-medium">C'est votre tour</span>
      {:else if !$gameState.gameOver}
        <span class="text-xs text-muted-foreground">Tour de l'adversaire</span>
      {/if}
    </div>

    <Separator class="my-4" />

    <!-- Status -->
    <div class="space-y-2">
      {#if $gameState.check && !$gameState.isCheckmate}
        <div class="bg-amber-500/15 text-amber-700 dark:text-amber-400 text-xs font-medium px-3 py-1.5 rounded-md">
          Echec !
        </div>
      {/if}

      {#if $gameState.gameOver}
        <div class="bg-primary/15 text-primary text-sm font-medium px-3 py-2 rounded-md space-y-1">
          <p class="font-semibold">Partie terminee</p>
          {#if $gameState.winner}
            <p>Gagnant : {$gameState.winner}</p>
          {:else}
            <p>Nulle</p>
          {/if}
          {#if $gameState.reason}
            <p class="text-xs opacity-75">{$gameState.reason}</p>
          {/if}
        </div>
      {/if}
    </div>

    <!-- Ma couleur -->
    {#if $gameState.myColor}
      <div class="mt-4 space-y-1">
        <span class="text-sm text-muted-foreground">Vous jouez</span>
        <div class="flex items-center gap-2">
          {#if $gameState.myColor === "white"}
            <div class="w-3 h-3 rounded-full bg-white border border-zinc-300"></div>
            <span class="font-medium text-sm">Blancs</span>
          {:else}
            <div class="w-3 h-3 rounded-full bg-zinc-800 dark:bg-zinc-300"></div>
            <span class="font-medium text-sm">Noirs</span>
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
          Proposer nulle
        </Button>
        <Button variant="outline" class="w-full justify-start bg-[#b58863] hover:bg-[#a07552] text-white border-[#a07552]" onclick={handleResign}>
          <FlagIcon class="w-4 h-4 mr-2" />
          Abandonner
        </Button>
      {:else}
        <Button variant="outline" class="w-full" onclick={() => window.history.back()}>
          Retour au lobby
        </Button>
      {/if}
    </div>
  </div>

  <!-- Center: Board -->
  <div class="flex-1 max-w-[800px] min-w-[400px]">
    <Board {gameId} />
  </div>

  <!-- Right Panel: Historique -->
  <div class="w-72 shrink-0 h-[800px] flex flex-col border rounded-lg p-5">
    <!-- Header -->
    <h2 class="text-lg font-semibold">Historique</h2>

    <!-- Move history -->
    <div class="flex-1 mt-4 rounded-lg bg-muted/50 flex items-center justify-center min-h-0">
      <span class="text-sm text-muted-foreground">Aucun coup pour le moment</span>
    </div>

    <!-- Timers -->
    <div class="grid grid-cols-2 gap-2 mt-4">
      <div class="flex items-center gap-2 rounded-lg px-3 py-2.5 {whiteIsActive ? 'bg-[#b58863] text-white' : 'bg-zinc-800 dark:bg-zinc-900 text-white'}">
        <div class="flex items-center gap-1.5">
          <div class="w-2 h-2 rounded-full bg-white"></div>
          <span class="text-xs font-medium">Blancs</span>
        </div>
        <div class="flex items-center gap-1 ml-auto">
          <ClockIcon class="w-3.5 h-3.5 opacity-70" />
          <span class="text-sm font-mono font-semibold {whiteIsLow ? 'text-red-400' : ''}">{whiteTime}</span>
        </div>
      </div>
      <div class="flex items-center gap-2 rounded-lg px-3 py-2.5 {blackIsActive ? 'bg-[#b58863] text-white' : 'bg-zinc-800 dark:bg-zinc-900 text-white'}">
        <div class="flex items-center gap-1.5">
          <div class="w-2 h-2 rounded-full bg-zinc-400"></div>
          <span class="text-xs font-medium">Noirs</span>
        </div>
        <div class="flex items-center gap-1 ml-auto">
          <ClockIcon class="w-3.5 h-3.5 opacity-70" />
          <span class="text-sm font-mono font-semibold {blackIsLow ? 'text-red-400' : ''}">{blackTime}</span>
        </div>
      </div>
    </div>
  </div>
</main>
