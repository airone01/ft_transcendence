import {
  applyMoveForSearch,
  isCheckmate,
  type Color,
  type GameState,
  type Move,
} from "$lib/chess";
import { getAllLegalMoves } from "$lib/chess/internal/gameEndChecks";
import { isKingInCheck } from "$lib/chess/internal/validation";
import { evaluate } from "./evaluate";
import { orderMoves } from "./order";

export function negamax(
  state: GameState,
  sharedHistory: string[],
  color: Color,
  alpha: number,
  beta: number,
  depth: number,
): number {
  if (state.halfMoveCount >= 100) return 0;

  const moves = orderMoves(getAllLegalMoves(state), state.board);

  const isWhite = state.turn === "w";
  if (isKingInCheck(state, isWhite) && moves.length === 0) return -1_000_000;

  if (moves.length === 0) return 0;

  if (depth === 0)
    return quiescence(state, sharedHistory, color, alpha, beta, moves);

  for (const move of moves) {
    const newState = applyMoveForSearch(
      { ...state, historyFEN: sharedHistory },
      move,
    );

    const score = -negamax(
      newState,
      sharedHistory,
      color === "w" ? "b" : "w",
      -beta,
      -alpha,
      depth - 1,
    );

    sharedHistory.pop();

    if (score >= beta) return beta;
    if (score > alpha) alpha = score;
  }
  return alpha;
}

function quiescence(
  state: GameState,
  sharedHistory: string[],
  color: Color,
  alpha: number,
  beta: number,
  existingMoves?: Move[],
): number {
  if (state.halfMoveCount >= 100) return 0;

  const moves =
    existingMoves ?? orderMoves(getAllLegalMoves(state), state.board);

  const isWhite = state.turn === "w";
  if (isKingInCheck(state, isWhite) && moves.length === 0) return -1_000_000;
  if (moves.length === 0) return 0;

  const score = evaluate(state, color);
  if (score >= beta) return beta;
  if (score > alpha) alpha = score;

  const captures = moves.filter((m) => m.capture);
  for (const move of captures) {
    const newState = applyMoveForSearch(
      { ...state, historyFEN: sharedHistory },
      move,
    );

    const score = -quiescence(
      newState,
      sharedHistory,
      color === "w" ? "b" : "w",
      -beta,
      -alpha,
    );

    sharedHistory.pop();

    if (score >= beta) return beta;
    if (score > alpha) alpha = score;
  }
  return alpha;
}
