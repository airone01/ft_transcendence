<script lang="ts">
import { ChessBishopIcon, ChessKingIcon, ChessKnightIcon, ChessPawnIcon, ChessQueenIcon, ChessRookIcon } from "@lucide/svelte";
import type { Component } from "svelte";
import { flip } from "svelte/animate";
import { type DndEvent, dndzone, TRIGGERS } from "svelte-dnd-action";
import { startGame, getLegalMoves, playMove, InvalidMove, EndGame, isCheckmate, isDraw } from "$lib/chess";
import type { GameState, Move, Piece as ChessPiece } from "$lib/chess";

// ─── Types ───────────────────────────────────────────────────────────────────

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

// ─── Piece → Icon mapping ────────────────────────────────────────────────────

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

// ─── State (Svelte 5 runes) ─────────────────────────────────────────────────

const initialState = startGame();
let gameState: GameState = $state(initialState);
let board: Square[] = $state(buildBoard(initialState));
let legalTargets: Set<number> = $state(new Set());
let dragFromIndex: number | null = $state(null);
let gameOverMessage: string | null = $state(null);

// ─── Build board from GameState ──────────────────────────────────────────────

function buildBoard(state: GameState): Square[] {
  const squares: Square[] = [];
  for (let row = 0; row < 8; row++) {
    for (let col = 0; col < 8; col++) {
      const index = row * 8 + col;
      const piece = state.board[row][col];
      const pieces: DndPiece[] = [];

      if (piece) {
        const isWhite = piece === piece.toUpperCase();
        const icon = pieceIconMap[piece.toLowerCase()];
        pieces.push({
          id: `${piece}-${row}-${col}`,
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

// ─── Coordinate helpers ──────────────────────────────────────────────────────

function indexToCoords(index: number): [number, number] {
  return [Math.floor(index / 8), index % 8];
}

function coordsToIndex(row: number, col: number): number {
  return row * 8 + col;
}

// ─── Drag and Drop ───────────────────────────────────────────────────────────

const flipDurationMs = 50;

function handleDndConsider(
  squareIndex: number,
  e: CustomEvent<DndEvent<DndPiece>>,
) {
  if (e.detail.info.trigger === TRIGGERS.DRAG_STARTED) {
    const piece = board[squareIndex].pieces[0];
    if (piece) {
      const [row, col] = indexToCoords(squareIndex);
      const chessPiece = gameState.board[row][col];

      if (chessPiece) {
        const isWhite = chessPiece === chessPiece.toUpperCase();
        const isCorrectTurn =
          (isWhite && gameState.turn === "w") ||
          (!isWhite && gameState.turn === "b");

        if (isCorrectTurn) {
          const moves = getLegalMoves(gameState, [row, col]);
          legalTargets = new Set(
            moves.map((m) => coordsToIndex(m.to[0], m.to[1])),
          );
          dragFromIndex = squareIndex;
        } else {
          legalTargets = new Set();
          dragFromIndex = null;
        }
      }
    }
  }

  board[squareIndex].pieces = e.detail.items;
  board = [...board];
}

function handleDndFinalize(
  squareIndex: number,
  e: CustomEvent<DndEvent<DndPiece>>,
) {
  const { info } = e.detail;

  // Only process valid moves: correct turn, legal target, dropped into a different zone
  if (
    info.trigger === TRIGGERS.DROPPED_INTO_ZONE &&
    dragFromIndex !== null &&
    dragFromIndex !== squareIndex &&
    legalTargets.has(squareIndex)
  ) {
    const [fromRow, fromCol] = indexToCoords(dragFromIndex);
    const [toRow, toCol] = indexToCoords(squareIndex);

    const moves = getLegalMoves(gameState, [fromRow, fromCol]);
    const legalMove = moves.find(
      (m) => m.to[0] === toRow && m.to[1] === toCol,
    );

    if (legalMove) {
      const piece = gameState.board[fromRow][fromCol];
      const isPromotion =
        piece?.toLowerCase() === "p" && (toRow === 0 || toRow === 7);

      if (isPromotion) {
        const promoPiece: ChessPiece =
          gameState.turn === "w" ? "Q" : "q";
        legalMove.promotion = promoPiece;
      }

      try {
        gameState = playMove(gameState, legalMove);

        if (isCheckmate(gameState)) {
          const winner = gameState.turn === "w" ? "Black" : "White";
          gameOverMessage = `Checkmate! ${winner} wins!`;
        } else if (isDraw(gameState)) {
          gameOverMessage = "Draw!";
        }
      } catch {
        // Move rejected by engine — board will be rebuilt below
      }
    }
  }

  // Always rebuild board from gameState to stay in sync
  board = buildBoard(gameState);
  legalTargets = new Set();
  dragFromIndex = null;
}

// ─── Helpers ─────────────────────────────────────────────────────────────────

function isLightSquare(index: number): boolean {
  const row = Math.floor(index / 8);
  const col = index % 8;
  return (row + col) % 2 === 0;
}

function isDragDisabled(index: number): boolean {
  const [row, col] = indexToCoords(index);
  const piece = gameState.board[row][col];
  if (!piece) return true;
  const isWhite = piece === piece.toUpperCase();
  return (isWhite && gameState.turn !== "w") || (!isWhite && gameState.turn !== "b");
}

function resetGame() {
  gameState = startGame();
  board = buildBoard(gameState);
  legalTargets = new Set();
  dragFromIndex = null;
  gameOverMessage = null;
}
</script>

<!-- Board with coordinates -->
<div class="flex flex-col">
  <div class="flex">
    <!-- Rank labels (left side) -->
    <div class="flex flex-col w-6 shrink-0">
      {#each ranks as rank}
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
    {#each files as file}
      <div class="flex-1 text-center text-xs font-medium text-amber-800/70 dark:text-amber-200/70 pt-1">
        {file}
      </div>
    {/each}
  </div>
</div>
