import { applyMoveForSearch, type GameState, type Move } from "$lib/chess";
import { getAllLegalMoves } from "$lib/chess/internal/gameEndChecks";
import { orderMoves } from "./order";
import { negamax } from "./search";

export function findBestMoveTimed(
  state: GameState,
  timeLimitMs: number = 3000,
): Move {
  const start = Date.now();

  let moves = orderMoves(getAllLegalMoves(state), state.board);
  let bestMove = moves[0];
  const sharedHistory = [...state.historyFEN];

  for (let depth = 1; depth <= 10; depth++) {
    if (Date.now() - start > timeLimitMs) break;

    let iterBestMove = moves[0];
    let iterBestScore = -Infinity;
    let alpha = -Infinity;

    for (const move of moves) {
      if (Date.now() - start > timeLimitMs) break;

      const newState = applyMoveForSearch(
        { ...state, historyFEN: sharedHistory },
        move,
      );

      const score = -negamax(
        newState,
        sharedHistory,
        state.turn === "w" ? "b" : "w",
        alpha,
        Infinity,
        depth,
      );

      sharedHistory.pop();

      if (score > iterBestScore) {
        iterBestScore = score;
        iterBestMove = move;
        alpha = score;
      }
    }

    const idx = moves.indexOf(iterBestMove);
    if (idx > 0)
      moves = [iterBestMove, ...moves.slice(0, idx), ...moves.slice(idx + 1)];

    bestMove = iterBestMove;
  }

  return bestMove;
}
