<script lang="ts">
import { ClockIcon, FlagIcon, HandshakeIcon, XIcon } from "@lucide/svelte";
import { Button } from "@transc/ui/button";
import * as Dialog from "@transc/ui/dialog";
import { Separator } from "@transc/ui/separator";
import { onDestroy } from "svelte";
import { goto } from "$app/navigation";
import { page } from "$app/state";
import { m } from "$lib/paraglide/messages";
import {
  acceptDraw,
  gameState,
  isMyTurn,
  leaveGame,
  type MoveRecord,
  offerDraw,
  quitBotGame,
  resign,
} from "$lib/stores/game.store";
import { socketConnected, socketManager } from "$lib/stores/socket.svelte";
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

const movePairs = $derived(() => {
  const pairs: [MoveRecord, MoveRecord | null][] = [];
  const moves = $gameState.moves;
  for (let i = 0; i < moves.length; i += 2) {
    pairs.push([moves[i], moves[i + 1] ?? null]);
  }
  return pairs;
});

const resolveGameReason = (reason: string) => {
  switch (reason) {
    case "checkmate":
      return m.game_page_reason_checkmate();
    case "stalemate":
      return m.game_page_reason_stalemate();
    case "draw":
      return m.game_page_reason_draw();
    case "timeout":
      return m.game_page_reason_timeout();
    case "agreement":
      return m.game_page_reason_agreement();
    case "resignation":
      return m.game_page_reason_resignation();
    default:
      return "";
  }
};

onDestroy(() => {
  const currentGameId = $gameState.gameId;

  if (
    currentGameId?.startsWith("bot-") &&
    $gameState.isBotGame &&
    !$gameState.gameOver
  ) {
    console.log("[Game] Page destroyed, emitting bot:quit for", currentGameId);
    socketManager.emit("bot:quit", { gameId: currentGameId });
  }
});
</script>

<main class="h-full flex items-center justify-center p-2 sm:p-4 lg:p-6">
  <div
    class="w-full max-w-[1424px] flex flex-col md:flex-row items-stretch gap-3 lg:gap-6 min-h-0"
  >
    <!-- Left Panel: Game Info — hidden on mobile/tablet, shown on desktop -->
    <div
      class="hidden xl:flex w-72 shrink-0 flex-col border rounded-lg p-5 overflow-hidden min-h-0"
    >
      <!-- Header -->
      <div class="flex items-center justify-between">
        <h2 class="text-lg font-semibold">{m.game_page_title()}</h2>
        {#if !$socketConnected}
          <span class="text-xs text-destructive"
            >{m.game_page_disconnected()}</span
          >
        {/if}
      </div>

      <Separator class="my-4" />

      <!-- Current turn -->
      <div class="space-y-1">
        <span class="text-sm text-muted-foreground"
          >{m.game_page_turn_title()}</span
        >
        <div class="flex items-center gap-2">
          {#if $gameState.turn === "w"}
            <div
              class="w-3 h-3 rounded-full bg-white border border-zinc-300"
            ></div>
            <span class="font-medium text-sm">{m.game_page_white()}</span>
          {:else}
            <div
              class="w-3 h-3 rounded-full bg-zinc-800 dark:bg-zinc-300"
            ></div>
            <span class="font-medium text-sm">{m.game_page_black()}</span>
          {/if}
        </div>
        {#if $isMyTurn}
          <span class="text-xs text-primary font-medium"
            >{m.game_page_turn_user()}</span
          >
        {:else if !$gameState.gameOver}
          <span class="text-xs text-muted-foreground"
            >{m.game_page_turn_opponent()}</span
          >
        {/if}
      </div>

      <Separator class="my-4" />

      <!-- Status -->
      <div class="space-y-2">
        {#if $gameState.check && !$gameState.isCheckmate}
          <div
            class="bg-amber-500/15 text-amber-700 dark:text-amber-400 text-xs font-medium px-3 py-1.5 rounded-md"
          >
            {m.game_page_status_check()}
          </div>
        {/if}

        {#if $gameState.gameOver}
          <div
            class="bg-primary/15 text-primary text-sm font-medium px-3 py-2 rounded-md space-y-1"
          >
            <p class="font-semibold">{m.game_page_status_game_over()}</p>
            {#if $gameState.winner}
              <p>{m.game_page_status_winner({ winner: $gameState.winner })}</p>
            {:else}
              <p>{m.game_page_status_draw()}</p>
            {/if}
            {#if $gameState.reason}
              <p class="text-xs opacity-75">
                {resolveGameReason($gameState.reason)}
              </p>
            {/if}
          </div>
        {/if}
      </div>

      <!-- My color -->
      {#if $gameState.isSpectator}
        <div class="mt-4 space-y-1">
          <span class="text-sm text-muted-foreground"
            >{m.game_page_spectator_title()}</span
          >
          <div class="flex items-center gap-2">
            <span class="font-medium text-sm"
              >{m.game_page_spectator_description()}</span
            >
          </div>
          <span class="text-xs text-muted-foreground"
            >{m.game_page_spectator_info()}</span
          >
        </div>
      {:else if $gameState.myColor}
        <!-- players code already exist-->
        <div class="mt-4 space-y-1">
          <span class="text-sm text-muted-foreground"
            >{m.game_page_color_title()}</span
          >
          <div class="flex items-center gap-2">
            {#if $gameState.myColor === "white"}
              <div
                class="w-3 h-3 rounded-full bg-white border border-zinc-300"
              ></div>
              <span class="font-medium text-sm">{m.game_page_white()}</span>
            {:else}
              <div
                class="w-3 h-3 rounded-full bg-zinc-800 dark:bg-zinc-300"
              ></div>
              <span class="font-medium text-sm">{m.game_page_black()}</span>
            {/if}
          </div>
        </div>
      {/if}

      <Separator class="my-4" />

      <!-- Controls -->
      <div class="space-y-2 mt-auto">
        {#if $gameState.isBotGame && !$gameState.gameOver}
          <Button
            variant="outline"
            class="w-full justify-start bg-destructive/10 hover:bg-destructive/20 text-destructive border-destructive/20"
            onclick={() => {
            quitBotGame();
            goto('/play');
          }}
          >
            <XIcon class="w-4 h-4 mr-2" />
            Quit Bot Game
          </Button>
        {:else if $gameState.isSpectator}
          <!-- exit spectate mode button -->
          <Button
            variant="outline"
            class="w-full"
            onclick={() => {
            leaveGame();
            window.history.back();
          }}
          >
            {m.game_page_button_leave_spectator()}
          </Button>
        {:else if !$gameState.gameOver}
          <!-- player code unchanged -->
          <Button
            variant="outline"
            class="w-full justify-start"
            onclick={handleOfferDraw}
            disabled={$gameState.drawOfferSent}
          >
            <HandshakeIcon class="w-4 h-4 mr-2" />
            {m.game_page_button_draw()}
          </Button>
          <Button
            variant="outline"
            class="w-full justify-start bg-[#b58863] hover:bg-[#a07552] text-white border-[#a07552]"
            onclick={() => (resignDialogOpen = true)}
          >
            <FlagIcon class="w-4 h-4 mr-2" />
            {m.game_page_button_resign()}
          </Button>
        {:else}
          <!-- game over code -->
          <Button
            variant="outline"
            class="w-full"
            onclick={() => window.history.back()}
          >
            {m.game_page_button_leave()}
          </Button>
        {/if}
      </div>
    </div>

    <!-- Center: Board + mobile status bar -->
    <div class="flex flex-col flex-1 min-w-64 xl:min-w-72 gap-3 min-h-0">
      <!-- Mobile/Tablet status bar -->
      <div class="flex xl:hidden items-center justify-between gap-2 flex-wrap">
        <div class="flex items-center gap-2">
          {#if !$socketConnected}
            <span class="text-xs text-destructive font-medium"
              >{m.game_page_disconnected()}</span
            >
          {:else if $gameState.gameOver}
            <span class="text-sm font-semibold text-primary">
              {m.game_page_status_game_over()} —
              {#if $gameState.winnerName}
                {m.game_page_status_winner({ winner: $gameState.winnerName })}
              {:else}
                {m.game_page_status_draw()}
              {/if}
            </span>
          {:else if $gameState.check && !$gameState.isCheckmate}
            <span
              class="text-xs font-medium text-amber-600 dark:text-amber-400 bg-amber-500/15 px-2 py-1 rounded-md"
              >{m.game_page_status_check()}</span
            >
          {:else if $isMyTurn}
            <span class="text-xs text-primary font-medium"
              >{m.game_page_turn_user()}</span
            >
          {:else}
            <span class="text-xs text-muted-foreground"
              >{m.game_page_turn_opponent()}</span
            >
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
        {#if $gameState.isSpectator}
          <Button
            size="sm"
            variant="outline"
            onclick={() => {
                leaveGame();
                window.history.back();
              }}
          >
            {m.game_page_button_leave_spectator()}
          </Button>
        {:else if !$gameState.gameOver}
          <div class="flex gap-2">
            {#if $gameState.isBotGame}
              <Button
                size="sm"
                variant="outline"
                class="bg-destructive/10 hover:bg-destructive/20 text-destructive border-destructive/20"
                onclick={() => {
                    quitBotGame();
                    goto('/play');
                  }}
              >
                <XIcon class="w-3.5 h-3.5" />
                <span class="hidden sm:inline ml-1">Quit Bot Game</span>
              </Button>
            {:else}
              <Button
                size="sm"
                variant="outline"
                onclick={handleOfferDraw}
                disabled={$gameState.drawOfferSent}
              >
                <HandshakeIcon class="w-3.5 h-3.5" />
                <span class="hidden sm:inline ml-1"
                  >{m.game_page_button_draw()}</span
                >
              </Button>
              <Button
                size="sm"
                variant="outline"
                class="bg-[#b58863] hover:bg-[#a07552] text-white border-[#a07552]"
                onclick={() => (resignDialogOpen = true)}
              >
                <FlagIcon class="w-3.5 h-3.5" />
                <span class="hidden sm:inline ml-1"
                  >{m.game_page_button_resign()}</span
                >
              </Button>
            {/if}
          </div>
        {:else}
          <Button
            size="sm"
            variant="outline"
            onclick={() => window.history.back()}
          >
            {m.game_page_button_leave()}
          </Button>
        {/if}
      </div>

      <div class="aspect-square w-full">
        <Board {gameId} />
      </div>
    </div>

    <!-- Right Panel: History + Timers -->
    <div
      class="md:w-64 lg:w-72 md:shrink-0 min-h-0 flex flex-col border rounded-lg p-4 lg:p-5 overflow-hidden"
    >
      <!-- Header — only on desktop -->
      <h2 class="hidden md:block text-lg font-semibold mb-4">
        {m.game_page_move_history_title()}
      </h2>

      <!-- Move history desktop -->
      <div
        class="hidden md:flex flex-col flex-1 rounded-lg bg-muted/50 overflow-y-auto min-h-0"
      >
        {#if movePairs().length === 0}
          <div class="h-full flex items-center justify-center w-full min-h-0">
            <span class="text-sm text-muted-foreground"
              >{m.game_page_move_history_empty()}</span
            >
          </div>
        {:else}
          <div
            class="p-2 space-y-0.5 w-full overflow-y-scroll min-h-0 shrink-1"
          >
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
                  {white.checkmate ? "#" : white.check ? "+" : ""}</span
                >
                {#if black}
                  <span class="font-mono"
                    >{black.from}-{black.to}
                    {black.promotion ?? ""}
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

      <div class="flex flex-col gap-2 mt-auto pt-4">
        <div
          class="flex items-center gap-2 rounded-lg px-3 py-2.5 {whiteIsActive
            ? 'bg-[#b58863] text-white'
            : 'bg-zinc-800 dark:bg-zinc-900 text-white'}"
        >
          <div class="flex items-center gap-1.5">
            <div class="w-2 h-2 rounded-full bg-white"></div>
            <span class="text-xs font-medium">{m.game_page_white()}</span>
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
            <span class="text-xs font-medium">{m.game_page_black()}</span>
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
          {m.game_page_move_history_title()}
        </summary>
        <div class="max-h-40 overflow-y-auto rounded-lg bg-muted/50 mt-2">
          {#if movePairs().length === 0}
            <div class="flex items-center justify-center py-4">
              <span class="text-sm text-muted-foreground"
                >{m.game_page_move_history_empty()}</span
              >
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
                    >{white.from}-{white.to}
                    {white.promotion ?? ""}
                    {white.checkmate ? "#" : white.check ? "+" : ""}</span
                  >
                  {#if black}
                    <span class="font-mono"
                      >{black.from}-{black.to}
                      {black.promotion ?? ""}
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
    </div>
  </div>

  <!-- Draw offer dialog (shown to the recipient) -->
  <Dialog.Root open={$gameState.drawOffered && !$gameState.gameOver}>
    <Dialog.Content showCloseButton={false}>
      <Dialog.Header>
        <Dialog.Title>{m.game_page_popup_draw_offer_title()}</Dialog.Title>
        <Dialog.Description>
          {m.game_page_popup_draw_offer_description()}
        </Dialog.Description>
      </Dialog.Header>
      <Dialog.Footer>
        <Button
          variant="outline"
          onclick={() =>
            gameState.update((s) => ({ ...s, drawOffered: false }))}
        >
          {m.game_page_popup_draw_offer_button_decline()}
        </Button>
        <Button onclick={acceptDraw}>
          <HandshakeIcon class="w-4 h-4 mr-2" />
          {m.game_page_popup_draw_offer_button_accept()}
        </Button>
      </Dialog.Footer>
    </Dialog.Content>
  </Dialog.Root>

  <!-- Resign confirmation dialog -->
  <Dialog.Root bind:open={resignDialogOpen}>
    <Dialog.Content showCloseButton={false}>
      <Dialog.Header>
        <Dialog.Title>{m.game_page_popup_resign_title()}</Dialog.Title>
        <Dialog.Description>
          {m.game_page_popup_resign_description()}
        </Dialog.Description>
      </Dialog.Header>
      <Dialog.Footer>
        <Dialog.Close>
          <Button variant="outline" class="w-full">
            {m.game_page_popup_resign_button_decline()}
          </Button>
        </Dialog.Close>
        <Button
          class="bg-[#b58863] hover:bg-[#a07552] text-white border-[#a07552]"
          onclick={confirmResign}
        >
          <FlagIcon class="w-4 h-4 mr-2" />
          {m.game_page_popup_resign_button_accept()}
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
              {m.game_page_popup_gameover_title_victory()}
            {:else if $gameState.isSpectator}
              {m.game_page_popup_gameover_title_spectator()}
            {:else}
              {m.game_page_popup_gameover_title_defeat()}
            {/if}
          {:else}
            {m.game_page_popup_gameover_title_draw()}
          {/if}
        </Dialog.Title>
        <Dialog.Description class="text-center space-y-2">
          {#if $gameState.winner}
            <p class="text-lg font-semibold">
              {m.game_page_popup_gameover_description_winner({
                winner: $gameState.winnerName || $gameState.winner,
              })}
            </p>
          {:else}
            <p class="text-lg font-semibold">
              {m.game_page_popup_gameover_description_draw()}
            </p>
          {/if}
          {#if $gameState.reason}
            <p class="text-sm text-muted-foreground capitalize">
              {resolveGameReason($gameState.reason)}
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
          {m.game_page_button_leave()}
        </Button>
      </Dialog.Footer>
    </Dialog.Content>
  </Dialog.Root>
</main>
