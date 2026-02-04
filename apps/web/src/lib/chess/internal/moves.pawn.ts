import type { GameState, Move, Piece } from "$lib/chess/internal/types";
import { isInBoard } from "$lib/chess/internal/utils";

/** @internal */
export function pawnMoves(state: GameState, from: [number, number]): Move[] {
  if (!isInBoard(from)) return [];

  const moves: Move[] = [];
  const [row, col] = from;
  const piece = state.board[row][col];

  if (!piece) return moves;

  const isWhite = piece === piece.toUpperCase();
  const dir = isWhite ? -1 : 1;
  const startRow = isWhite ? 6 : 1;
  const promotionRow = isWhite ? 0 : 7;
  const promotions: Piece[] = isWhite
    ? ["Q", "R", "B", "N"]
    : ["q", "r", "b", "n"];

  const oneStep: [number, number] = [row + dir, col];
  if (!state.board[oneStep[0]][oneStep[1]]) {
    if (oneStep[0] === promotionRow) {
      for (const p of promotions)
        moves.push({ from: from, to: oneStep, promotion: p });
    } else {
      moves.push({ from: from, to: oneStep });
    }

    if (row === startRow) {
      const twoStep: [number, number] = [row + 2 * dir, col];
      if (!state.board[twoStep[0]][twoStep[1]]) {
        moves.push({ from: from, to: twoStep });
      }
    }
  }

  for (const dc of [-1, 1]) {
    const diag: [number, number] = [row + dir, col + dc];
    if (!isInBoard(diag)) continue;

    const target = state.board[diag[0]][diag[1]];
    if (target && (target === target.toUpperCase()) !== isWhite) {
      if (diag[0] === promotionRow) {
        for (const p of promotions)
          moves.push({ from: from, to: diag, promotion: p });
      } else {
        moves.push({ from: from, to: diag });
      }
    }

    if (
      state.enPassant &&
      diag[0] === state.enPassant[0] &&
      diag[1] === state.enPassant[1]
    ) {
      moves.push({ from: from, to: diag });
    }
  }

  return moves;
}
