import type { GameState, Move, Piece } from "$lib/chess/internal/types";
import { isKingInCheck } from "$lib/chess/internal/validation";
import { getLegalMoves } from "$lib/chess/internal/validation";

/**
 * Returns true if the current player is in checkmate, false otherwise.
 * A player is in checkmate if their king is in check and they have no legal moves to get out of check.
 *
 * @param state The current game state.
 * @returns True if the current player is in checkmate, false otherwise.
 */
export function isCheckmate(state: GameState): boolean {
  const isWhite = state.turn === "w";
  if (!isKingInCheck(state, isWhite)) return false;

  const moves = getAllLegalMoves(state);
  return moves.length === 0;
}

/**
 * Returns true if the game is a draw, false otherwise.
 * A game is a draw if it is a stalemate, has insufficient material, has reached the fifty-move rule, or has reached a threefold repetition.
 *
 * @param state The current game state.
 * @returns True if the game is a draw, false otherwise.
 */
export function isDraw(state: GameState): boolean {
  return (
    isStalemate(state) ||
    isInsufficientMaterial(state) ||
    isFiftyMoveRule(state) ||
    isThreefoldRepetition(state)
  );
}

/** @internal */
export function isStalemate(state: GameState): boolean {
  const isWhite = state.turn === "w";
  if (isKingInCheck(state, isWhite)) return false;

  const moves = getAllLegalMoves(state);
  return moves.length === 0;
}

/** @internal */
export function getAllLegalMoves(state: GameState): Move[] {
  const moves: Move[] = [];

  for (let r = 0; r < 8; r++) {
    for (let c = 0; c < 8; c++) {
      const piece = state.board[r][c];

      if (!piece) continue;

      const pieceColor = piece === piece.toUpperCase() ? "w" : "b";
      if (pieceColor !== state.turn) continue;

      const pieceMoves = getLegalMoves(state, [r, c]);
      moves.push(...pieceMoves);
    }
  }

  return moves;
}

/** @internal */
export function isInsufficientMaterial(state: GameState): boolean {
  let whiteMinors: Piece[] = [];
  let blackMinors: Piece[] = [];

  let whiteSquare: number | null = null;
  let blackSquare: number | null = null;

  for (let r = 0; r < 8; r++) {
    for (let c = 0; c < 8; c++) {
      const piece = state.board[r][c];
      if (!piece) continue;

      switch (piece.toLowerCase()) {
        case "p":
        case "q":
        case "r":
          return false;

        case "b":
          if (piece === "B") {
            whiteMinors.push(piece);
            whiteSquare = (r + c) % 2;
          } else {
            blackMinors.push(piece);
            blackSquare = (r + c) % 2;
          }
          break;

        case "n":
          if (piece === "N") whiteMinors.push(piece);
          else blackMinors.push(piece);
          break;
      }
    }
  }

  if (whiteMinors.length === 0 && blackMinors.length === 0) return true;

  if (
    (whiteMinors.length === 1 && blackMinors.length === 0) ||
    (whiteMinors.length === 0 && blackMinors.length === 1)
  )
    return true;

  if (
    whiteMinors.length === 1 &&
    blackMinors.length === 1 &&
    whiteMinors[0]?.toLowerCase() === "b" &&
    blackMinors[0]?.toLowerCase() === "b"
  )
    return whiteSquare === blackSquare;

  return false;
}

/** @internal */
export function isFiftyMoveRule(state: GameState): boolean {
  return state.halfMoveCount >= 100;
}

/** @internal */
export function isThreefoldRepetition(state: GameState): boolean {
  // TODO ?
  return false;
}
