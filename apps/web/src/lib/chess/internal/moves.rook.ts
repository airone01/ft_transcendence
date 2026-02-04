import type { GameState, Move } from "$lib/chess/internal/types";
import { isInBoard } from "$lib/chess/internal/utils";

/** @internal */
export function rookMoves(state: GameState, from: [number, number]): Move[] {
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
  ];

  for (const [dr, dc] of deltas) {
    let r = row + dr;
    let c = col + dc;
    while (isInBoard([r, c])) {
      const target = state.board[r][c];
      if (!target) {
        moves.push({ from, to: [r, c] });
      } else {
        if ((target === target.toUpperCase()) !== isWhite) {
          moves.push({ from, to: [r, c] });
        }
        break;
      }
      r += dr;
      c += dc;
    }
  }

  return moves;
}
