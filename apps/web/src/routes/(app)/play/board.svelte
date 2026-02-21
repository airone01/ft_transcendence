<script lang="ts">
import { ChessBishopIcon, ChessKingIcon, ChessKnightIcon, ChessPawnIcon, ChessQueenIcon, ChessRookIcon } from "@lucide/svelte";
import type { Component } from "svelte";
import { onMount, onDestroy } from "svelte";
import { flip } from "svelte/animate";
import { type DndEvent, dndzone, TRIGGERS } from "svelte-dnd-action";
import { startGame, getLegalMoves, parseFEN, playMove } from "$lib/chess";
import type { GameState, Piece as ChessPiece, Move } from "$lib/chess";
import { gameState as gameStore, joinGame, makeMove } from "$lib/stores/game.store";
import { socketConnected } from "$lib/stores/socket.svelte";

// Props

let { gameId }: { gameId: string } = $props();

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
const initialState = startGame();
let localState: GameState = $state(initialState);
let board: Square[] = $state(buildBoard(initialState));
let legalTargets: Set<number> = $state(new Set());
let dragFromIndex: number | null = $state(null);
let isDragging = false;
let rebuildScheduled = false;


const unsubscribe = gameStore.subscribe((store) => {
  myColor = store.myColor;
  gameOver = store.gameOver;
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
    if (connected) joinGame(gameId);
  });
});

onDestroy(() => {
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
            moves.map((m) => {
              const r = myColor === "black" ? 7 - m.to[0] : m.to[0];
              const c = myColor === "black" ? 7 - m.to[1] : m.to[1];
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

  // Only process valid moves
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
    const promotion = isPromotion ? "q" : undefined;

    const fromAlgebraic = files[fromCol] + ranks[fromRow];
    const toAlgebraic = files[toCol] + ranks[toRow];
    makeMove(fromAlgebraic, toAlgebraic, promotion);

    try {
      const move: Move = {
        from: [fromRow, fromCol],
        to: [toRow, toCol],
        promotion: isPromotion ? ("Q" as ChessPiece) : undefined,
      };
      localState = playMove(localState, move);
    } catch {
    }
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
  if (gameOver) return true;
  const [row, col] = indexToBoard(index);
  const piece = localState.board[row][col];
  if (!piece) return true;
  const isWhite = piece === piece.toUpperCase();
  if (myColor === "white" && !isWhite) return true;
  if (myColor === "black" && isWhite) return true;
  return (isWhite && localState.turn !== "w") || (!isWhite && localState.turn !== "b");
}

// Labels (flipped if black)
const displayFiles = $derived(myColor === "black" ? [...files].reverse() : files);
const displayRanks = $derived(myColor === "black" ? [...ranks].reverse() : ranks);
</script>

<!-- Board -->
<div class="flex flex-col">
  <div class="flex">
    <div class="flex flex-col w-6 shrink-0">
      {#each displayRanks as rank}
        <div class="flex-1 flex items-center justify-center text-xs font-medium text-amber-800/70 dark:text-amber-200/70">
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
              <div
                class="w-1/4 h-1/4 rounded-full bg-black/25"
              ></div>
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
              class="col-start-1 row-start-1 z-10 w-full h-full cursor-grab active:cursor-grabbing flex justify-center items-center p-1"
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

  <!-- File labels (bottom) -->
  <div class="flex pl-6">
    {#each displayFiles as file}
      <div class="flex-1 text-center text-xs font-medium text-amber-800/70 dark:text-amber-200/70 pt-1">
        {file}
      </div>
    {/each}
  </div>
</div>
