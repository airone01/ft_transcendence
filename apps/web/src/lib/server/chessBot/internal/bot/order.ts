import type { Board, Move } from "$lib/chess";
import { pieceValues } from "./values";

function scoreMoveForOrdering(move: Move, board: Board): number {
  let score = 0;

  if (move.capture) {
    const attacker = board[move.from[0]][move.from[1]];
    const victim = board[move.to[0]][move.to[1]];
    if (attacker && victim) {
      score +=
        10 * pieceValues[victim.toUpperCase()] -
        pieceValues[attacker.toUpperCase()];
    }
  }

  if (move.promotion) score += pieceValues[move.promotion.toUpperCase()];

  return score;
}

export function orderMoves(moves: Move[], board: Board): Move[] {
  return moves.sort(
    (a, b) => scoreMoveForOrdering(b, board) - scoreMoveForOrdering(a, board),
  );
}
