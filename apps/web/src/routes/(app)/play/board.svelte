<script lang="ts">
import {
  ChessBishopIcon,
  ChessKingIcon,
  ChessKnightIcon,
  ChessPawnIcon,
  ChessQueenIcon,
  ChessRookIcon,
} from "@lucide/svelte";
import type { Component } from "svelte";
import { onDestroy, onMount } from "svelte";
import { flip } from "svelte/animate";
import { get } from "svelte/store";
import { type DndEvent, dndzone, TRIGGERS } from "svelte-dnd-action";
import type { Piece as ChessPiece, GameState, Move } from "$lib/chess";
import { getLegalMoves, parseFEN, playMove, startGame } from "$lib/chess";
import { m } from "$lib/paraglide/messages";
import {
  gameState as gameStore,
  joinGame,
  leaveGame,
  makeMove,
} from "$lib/stores/game.store";
import { socketConnected, socketManager } from "$lib/stores/socket.svelte";

// Props
const { gameId }: { gameId: string } = $props();
// Types

type DndPiece = {
  id: string;
  piece: ChessPiece;
  icon: Component;
  isWhite: boolean;
};

type Square = {
  id: number;
  pieces: DndPiece[];
};

// Piece → Icon mapping

const pieceIconMap: Record<string, Component> = {
  p: ChessPawnIcon,
  n: ChessKnightIcon,
  b: ChessBishopIcon,
  r: ChessRookIcon,
  q: ChessQueenIcon,
  k: ChessKingIcon,
};

const files = ["a", "b", "c", "d", "e", "f", "g", "h"];
const ranks = ["8", "7", "6", "5", "4", "3", "2", "1"];

// State — driven by websocket store

let myColor: "white" | "black" | null = $state(null);
let gameOver = $state(false);
let isSpectator = $state(false);
let isBotGame = $state(false);
const initialState = startGame();
let localState: GameState = $state(initialState);
let board: Square[] = $state(buildBoard(initialState));
let legalTargets: Set<number> = $state(new Set());
let dragFromIndex: number | null = $state(null);
let isDragging = false;
let rebuildScheduled = false;
let showPromotionDialog = $state(false);
let promotionMove = $state<{
  fromRow: number;
  fromCol: number;
  toRow: number;
  toCol: number;
} | null>(null);
let selectedPromotion = $state<"q" | "r" | "b" | "n">("q");

const unsubscribe = gameStore.subscribe((store) => {
  myColor = store.isBotGame ? "white" : store.myColor;
  gameOver = store.gameOver;
  isSpectator = store.isSpectator;
  isBotGame = store.isBotGame;
  if (store.fen) {
    localState = parseFEN(store.fen);
    if (!isDragging) {
      board = buildBoard(localState);
    }
  }
});

let unsubSocket: () => void;

onMount(() => {
  unsubSocket = socketConnected.subscribe((connected) => {
    const state = get(gameStore);
    if (connected && !gameOver && !state.isBotGame) joinGame(gameId);
  });
});

onDestroy(() => {
  if (isSpectator) {
    console.log("[Board] Leaving game (spectator mode)");
    leaveGame();
  }

  unsubSocket?.();
  unsubscribe();
});

// Build board from GameState

function buildBoard(state: GameState): Square[] {
  const squares: Square[] = [];
  for (let row = 0; row < 8; row++) {
    for (let col = 0; col < 8; col++) {
      // Flip perspective for black
      const displayRow = myColor === "black" ? 7 - row : row;
      const displayCol = myColor === "black" ? 7 - col : col;
      const index = row * 8 + col;
      const piece = state.board[displayRow][displayCol];
      const pieces: DndPiece[] = [];

      if (piece) {
        const isWhite = piece === piece.toUpperCase();
        const icon = pieceIconMap[piece.toLowerCase()];
        pieces.push({
          id: `${piece}-${displayRow}-${displayCol}`,
          piece,
          icon,
          isWhite,
        });
      }

      squares.push({ id: index, pieces });
    }
  }
  return squares;
}

// Coordinate helpers (account for board flip)

function indexToBoard(index: number): [number, number] {
  const row = Math.floor(index / 8);
  const col = index % 8;
  if (myColor === "black") {
    return [7 - row, 7 - col];
  }
  return [row, col];
}

function coordsToIndex(row: number, col: number): number {
  return row * 8 + col;
}

// Drag and Drop

const flipDurationMs = 50;

function handleDndConsider(
  squareIndex: number,
  e: CustomEvent<DndEvent<DndPiece>>,
) {
  if (e.detail.info.trigger === TRIGGERS.DRAG_STARTED) {
    const piece = board[squareIndex].pieces[0];
    if (piece) {
      const [row, col] = indexToBoard(squareIndex);
      const chessPiece = localState.board[row][col];

      if (chessPiece) {
        const isWhite = chessPiece === chessPiece.toUpperCase();
        const isMyPiece =
          (myColor === "white" && isWhite) || (myColor === "black" && !isWhite);
        const isCorrectTurn =
          (isWhite && localState.turn === "w") ||
          (!isWhite && localState.turn === "b");

        if (isMyPiece && isCorrectTurn) {
          const moves = getLegalMoves(localState, [row, col]);
          legalTargets = new Set(
            moves.map((move) => {
              const r = myColor === "black" ? 7 - move.to[0] : move.to[0];
              const c = myColor === "black" ? 7 - move.to[1] : move.to[1];
              return coordsToIndex(r, c);
            }),
          );
          dragFromIndex = squareIndex;
          isDragging = true;
        } else {
          legalTargets = new Set();
          dragFromIndex = null;
        }
      }
    }
  }

  if (!isDragging || squareIndex === dragFromIndex) {
    board[squareIndex].pieces = e.detail.items;
  }
}

function scheduleRebuild() {
  if (rebuildScheduled) return;
  rebuildScheduled = true;
  setTimeout(() => {
    isDragging = false;
    legalTargets = new Set();
    dragFromIndex = null;
    board = buildBoard(localState);
    rebuildScheduled = false;
  }, 0);
}

function handleDndFinalize(
  squareIndex: number,
  e: CustomEvent<DndEvent<DndPiece>>,
) {
  board[squareIndex].pieces = e.detail.items;
  const { info } = e.detail;

  if (
    info.trigger === TRIGGERS.DROPPED_INTO_ZONE &&
    dragFromIndex !== null &&
    dragFromIndex !== squareIndex &&
    legalTargets.has(squareIndex)
  ) {
    const [fromRow, fromCol] = indexToBoard(dragFromIndex);
    const [toRow, toCol] = indexToBoard(squareIndex);

    const piece = localState.board[fromRow][fromCol];
    const isPromotion =
      piece?.toLowerCase() === "p" && (toRow === 0 || toRow === 7);

    if (isPromotion) {
      promotionMove = { fromRow, fromCol, toRow, toCol };
      showPromotionDialog = true;
      scheduleRebuild();
      return;
    }

    const fromAlgebraic = files[fromCol] + ranks[fromRow];
    const toAlgebraic = files[toCol] + ranks[toRow];

    if (isBotGame) {
      socketManager.emit("bot:move", {
        gameId,
        from: fromAlgebraic,
        to: toAlgebraic,
      });
    } else {
      makeMove(fromAlgebraic, toAlgebraic);
    }

    try {
      const move: Move = {
        from: [fromRow, fromCol],
        to: [toRow, toCol],
      };
      localState = playMove(localState, move);
    } catch {}
  }
  scheduleRebuild();
}

//  Helpers

function isLightSquare(index: number): boolean {
  const row = Math.floor(index / 8);
  const col = index % 8;
  return (row + col) % 2 === 0;
}

function isDragDisabled(index: number): boolean {
  if (isSpectator) return true;
  if (gameOver) return true;
  const [row, col] = indexToBoard(index);
  const piece = localState.board[row][col];
  if (!piece) return true;
  const isWhite = piece === piece.toUpperCase();
  if (myColor === "white" && !isWhite) return true;
  if (myColor === "black" && isWhite) return true;
  return (
    (isWhite && localState.turn !== "w") ||
    (!isWhite && localState.turn !== "b")
  );
}

// Labels (flipped if black)
const displayFiles = $derived(
  myColor === "black" ? [...files].reverse() : files,
);
const displayRanks = $derived(
  myColor === "black" ? [...ranks].reverse() : ranks,
);

function confirmPromotion() {
  if (!promotionMove) return;

  const { fromRow, fromCol, toRow, toCol } = promotionMove;
  const fromAlgebraic = files[fromCol] + ranks[fromRow];
  const toAlgebraic = files[toCol] + ranks[toRow];

  if (isBotGame) {
    socketManager.emit("bot:move", {
      gameId,
      from: fromAlgebraic,
      to: toAlgebraic,
      promotion: selectedPromotion,
    });
  } else {
    makeMove(fromAlgebraic, toAlgebraic, selectedPromotion);
  }

  try {
    const move: Move = {
      from: [fromRow, fromCol],
      to: [toRow, toCol],
      promotion: selectedPromotion.toUpperCase() as ChessPiece,
    };
    localState = playMove(localState, move);
  } catch {}

  showPromotionDialog = false;
  promotionMove = null;
  selectedPromotion = "q";
}
</script>

<!-- Board -->
<div class="flex flex-col">
  <div class="flex">
    <div class="flex flex-col w-6 shrink-0">
      {#each displayRanks as rank}
        <div
          class="flex-1 flex items-center justify-center text-xs font-medium text-amber-800/70 dark:text-amber-200/70"
        >
          {rank}
        </div>
      {/each}
    </div>

    <!-- Board grid -->
    <div
      class="flex-1 aspect-square grid grid-rows-8 grid-cols-8 select-none overflow-hidden rounded-sm"
    >
      {#each board as square, index (square.id)}
        {@const isHighlighted = legalTargets.has(index)}
        {@const hasEnemyPiece =
          isHighlighted && square.pieces.length > 0}
        {@const disabled = isDragDisabled(index)}
        <div
          class="relative w-full h-full text-3xl grid grid-cols-1 grid-rows-1 place-items-center
            {isLightSquare(index)
            ? 'bg-[#f0d9b5]'
            : 'bg-[#b58863]'}"
          use:dndzone={{
            items: square.pieces,
            flipDurationMs,
            dragDisabled: disabled,
            dropTargetClasses: [],
            dropAnimationDisabled: false,
            useCursorForDetection: true,
          }}
          onconsider={(e) => handleDndConsider(index, e)}
          onfinalize={(e) => handleDndFinalize(index, e)}
        >
          <!-- Legal move indicator -->
          {#if isHighlighted && !hasEnemyPiece}
            <div
              class="absolute inset-0 flex items-center justify-center pointer-events-none z-20"
            >
              <div class="w-1/4 h-1/4 rounded-full bg-black/25"></div>
            </div>
          {/if}
          {#if hasEnemyPiece}
            <div
              class="absolute inset-0 rounded-full border-[3px] border-black/25 pointer-events-none z-20 m-0.5"
            ></div>
          {/if}

          {#each square.pieces as dndPiece (dndPiece.id)}
            {@const Icon = dndPiece.icon}
            <div
              animate:flip={{ duration: flipDurationMs }}
              class="col-start-1 row-start-1 w-full h-full cursor-grab active:cursor-grabbing flex justify-center items-center p-1"
            >
              <Icon
                class="w-full h-full {dndPiece.isWhite
                  ? 'stroke-white fill-white/20'
                  : 'stroke-zinc-900 fill-zinc-900/20'}"
              />
            </div>
          {/each}
        </div>
      {/each}
    </div>
  </div>

  {#if showPromotionDialog}
    <div
      class="fixed inset-0 bg-black/50 flex items-center justify-center z-50"
    >
      <div class="bg-background border rounded-lg p-6 space-y-4 max-w-md">
        <h3 class="text-lg font-semibold text-center">
          {m.game_page_promotion_title()}
        </h3>

        <div class="grid grid-cols-4 gap-3">
          <button
            class="p-4 border-2 rounded-lg hover:border-primary hover:bg-primary/10 transition-colors"
            onclick={() => {
              selectedPromotion = 'q';
              confirmPromotion();
            }}
          >
            <ChessQueenIcon
              class="w-12 h-12 mx-auto {myColor === 'white' ? 'stroke-white fill-white/20' : 'stroke-zinc-900 fill-zinc-900/20'}"
            />
            <p class="text-xs mt-1">{m.game_page_promotion_queen()}</p>
          </button>

          <button
            class="p-4 border-2 rounded-lg hover:border-primary hover:bg-primary/10 transition-colors"
            onclick={() => {
              selectedPromotion = 'r';
              confirmPromotion();
            }}
          >
            <ChessRookIcon
              class="w-12 h-12 mx-auto {myColor === 'white' ? 'stroke-white fill-white/20' : 'stroke-zinc-900 fill-zinc-900/20'}"
            />
            <p class="text-xs mt-1">{m.game_page_promotion_rook()}</p>
          </button>

          <button
            class="p-4 border-2 rounded-lg hover:border-primary hover:bg-primary/10 transition-colors"
            onclick={() => {
              selectedPromotion = 'b';
              confirmPromotion();
            }}
          >
            <ChessBishopIcon
              class="w-12 h-12 mx-auto {myColor === 'white' ? 'stroke-white fill-white/20' : 'stroke-zinc-900 fill-zinc-900/20'}"
            />
            <p class="text-xs mt-1">{m.game_page_promotion_bishop()}</p>
          </button>

          <button
            class="p-4 border-2 rounded-lg hover:border-primary hover:bg-primary/10 transition-colors"
            onclick={() => {
              selectedPromotion = 'n';
              confirmPromotion();
            }}
          >
            <ChessKnightIcon
              class="w-12 h-12 mx-auto {myColor === 'white' ? 'stroke-white fill-white/20' : 'stroke-zinc-900 fill-zinc-900/20'}"
            />
            <p class="text-xs mt-1">{m.game_page_promotion_knight()}</p>
          </button>
        </div>
      </div>
    </div>
  {/if}

  <!-- File labels (bottom) -->
  <div class="flex pl-6">
    {#each displayFiles as file}
      <div
        class="flex-1 text-center text-xs font-medium text-amber-800/70 dark:text-amber-200/70 pt-1"
      >
        {file}
      </div>
    {/each}
  </div>
</div>
