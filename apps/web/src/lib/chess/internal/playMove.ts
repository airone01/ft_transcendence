import type { GameState, Move, Piece } from "$lib/chess/internal/types";
import { applyMoveCopy, getLegalMoves } from "$lib/chess/internal/validation";
import { isCheckmate, isDraw } from "./gameEndChecks";
import { boardToFEN } from "./handleFEN";

/**
 *
 * Applies a move to a game state.
 * Throws an error if the move is illegal.
 *
 * @param state The game state to apply the move to.
 * @param move The move to apply.
 * @throws {Error} If the move is illegal.
 * @returns The resulting game state after applying the move.
 */
export function playMove(state: GameState, move: Move): GameState {
  if (isCheckmate(state) || isDraw(state)) throw new Error("Game finished!");

  const moves = getLegalMoves(state, move.from);

  if (!moves.find((m) => m.to[0] === move.to[0] && m.to[1] === move.to[1]))
    throw new Error("Illegal Move!");

  const newState: GameState = applyMoveCopy(state, move);

  const [fr, fc] = move.from;
  const [tr, _tc] = move.to;
  const piece: Piece | null = state.board[fr][fc];

  newState.turn = state.turn === "w" ? "b" : "w";

  if (piece?.toLowerCase() === "k") {
    if (state.turn === "w") {
      newState.castling.whiteKingSide = false;
      newState.castling.whiteQueenSide = false;
    } else {
      newState.castling.blackKingSide = false;
      newState.castling.blackQueenSide = false;
    }
  }

  if (piece?.toLowerCase() === "r") {
    if (state.turn === "w") {
      if (fr === 7 && fc === 0) newState.castling.whiteQueenSide = false;
      else if (fr === 7 && fc === 7) newState.castling.whiteKingSide = false;
    } else {
      if (fr === 0 && fc === 0) newState.castling.blackQueenSide = false;
      else if (fr === 0 && fc === 7) newState.castling.blackKingSide = false;
    }
  }

  if (piece?.toLowerCase() === "p" && Math.abs(tr - fr) === 2)
    newState.enPassant = [(fr + tr) / 2, fc];
  else newState.enPassant = null;

  if (piece?.toLowerCase() === "p" || move?.capture) newState.halfMoveCount = 0;
  else newState.halfMoveCount++;

  if (newState.turn === "w") newState.fullMoveCount++;

  newState.historyFEN.push(boardToFEN(newState));

  return newState;
}
