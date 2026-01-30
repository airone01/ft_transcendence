import type { GameState, Move } from "$lib/chess/internal/types";
import { isInBoard } from "$lib/chess/internal/utils";

/** @internal */
export function kingMoves(state: GameState, from: [number, number]): Move[] {
  return [...normalKingMoves(state, from), ...castleMoves(state, from)];
}

/** @internal */
export function normalKingMoves(
  state: GameState,
  from: [number, number],
): Move[] {
  if (!isInBoard(from)) return [];

  const moves: Move[] = [];
  const [row, col] = from;
  const piece = state.board[row][col];

  if (!piece) return moves;

  const isWhite = piece === piece.toUpperCase();
  const deltas: [number, number][] = [
    [-1, 0],
    [1, 0],
    [0, -1],
    [0, 1],

    [-1, -1],
    [-1, 1],
    [1, -1],
    [1, 1],
  ];

  for (const [dr, dc] of deltas) {
    const to: [number, number] = [row + dr, col + dc];
    if (!isInBoard(to)) continue;

    const target = state.board[to[0]][to[1]];

    if (!target || (target === target.toUpperCase()) !== isWhite)
      moves.push({ from: from, to: to });
  }

  return moves;
}

/** @internal */
export function castleMoves(state: GameState, from: [number, number]): Move[] {
  if (!isInBoard(from)) return [];

  const moves: Move[] = [];
  const [row, col] = from;
  const piece = state.board[row][col];

  if (!piece) return moves;

  const isWhite = piece === piece.toUpperCase();

  if (isWhite && row === 7 && col === 4) {
    if (state.castling.whiteKingSide) {
      if (!state.board[7][5] && !state.board[7][6]) {
        moves.push({
          from: from,
          to: [7, 6],
          castle: "k",
        });
      }
    }

    if (state.castling.whiteQueenSide) {
      if (!state.board[7][1] && !state.board[7][2] && !state.board[7][3]) {
        moves.push({
          from,
          to: [7, 2],
          castle: "q",
        });
      }
    }
  }

  if (!isWhite && row === 0 && col === 4) {
    if (state.castling.blackKingSide) {
      if (!state.board[0][5] && !state.board[0][6]) {
        moves.push({
          from,
          to: [0, 6],
          castle: "k",
        });
      }
    }

    if (state.castling.blackQueenSide) {
      if (!state.board[0][1] && !state.board[0][2] && !state.board[0][3]) {
        moves.push({
          from,
          to: [0, 2],
          castle: "q",
        });
      }
    }
  }

  return moves;
}
