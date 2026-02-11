import type { GameState, Move } from "$lib/chess/internal/types";
import { isInBoard } from "$lib/chess/internal/utils";

/** @internal */
export function knightMoves(state: GameState, from: [number, number]): Move[] {
  if (!isInBoard(from)) return [];

  const moves: Move[] = [];
  const [row, col] = from;
  const piece = state.board[row][col];

  if (!piece) return moves;

  const isWhite = piece === piece.toUpperCase();
  const deltas: [number, number][] = [
    [-2, -1],
    [-2, 1],
    [-1, -2],
    [-1, 2],
    [1, -2],
    [1, 2],
    [2, -1],
    [2, 1],
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
