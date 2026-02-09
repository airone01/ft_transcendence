import type { GameState, Move, Piece } from "$lib/chess/internal/types";
import { applyMoveCopy, getLegalMoves } from "$lib/chess/internal/validation";
import { EndGame, InvalidMove } from "./errors";
import { isCheckmate, isDraw } from "./gameEndChecks";
import { boardToFEN } from "./handleFEN";

/**
 * Applies a move to a GameState object.
 *
 * @param state The GameState object to apply the move to.
 * @param move The Move object to apply to the GameState.
 * @throws {EndGame} If the game is over (checkmate or draw).
 * @throws {InvalidMove} If the move is invalid.
 * @returns The new GameState object after the move has been applied.
 */
export function playMove(state: GameState, move: Move): GameState {
  if (isCheckmate(state) || isDraw(state)) throw new EndGame();

  const moves = getLegalMoves(state, move.from);

  if (!moves.find((m) => m.to[0] === move.to[0] && m.to[1] === move.to[1]))
    throw new InvalidMove();

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
