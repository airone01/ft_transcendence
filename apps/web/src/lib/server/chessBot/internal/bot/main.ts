import { applyMoveForSearch, type GameState, type Move } from "$lib/chess";
import { getAllLegalMoves } from "$lib/chess/internal/gameEndChecks";
import { negamax } from "./search";

export function findBestMove(state: GameState, depth: number = 3): Move {
  const moves = getAllLegalMoves(state);
  let bestMove = moves[0];
  const sharedHistory = [...state.historyFEN];

  let bestScore = -Infinity;
  let alpha = -Infinity;

  for (const move of moves) {
    const newState = applyMoveForSearch(
      { ...state, historyFEN: sharedHistory },
      move,
    );

    const score = -negamax(
      newState,
      sharedHistory,
      state.turn === "w" ? "b" : "w",
      -Infinity,
      Infinity,
      depth,
    );

    sharedHistory.pop();

    if (score > bestScore) {
      bestScore = score;
      bestMove = move;
      alpha = score;
    }
  }

  return bestMove;
}

// export function findBestMoveTimed(state: GameState, timeLimitMs: number): Move {
//   const start = Date.now();

//   let moves = getAllLegalMoves(state);
//   let bestMove = moves[0];
//   const sharedHistory = [...state.historyFEN];

//   for (let depth = 1; depth <= 10; depth++) {
//     if (Date.now() - start > timeLimitMs) break;

//     let iterBest = moves[0];
//     let iterScore = -Infinity;
//     let alpha = -Infinity;

//     for (const move of moves) {
//       if (Date.now() - start > timeLimitMs) break;

//       const newState = applyMoveForSearch(
//         { ...state, historyFEN: sharedHistory },
//         move,
//       );
//       const score = -negamax(
//         newState,
//         sharedHistory,
//         state.turn === "w" ? "b" : "w",
//         -Infinity,
//         Infinity,
//         depth,
//       );
//       sharedHistory.pop();

//       if (score > iterScore) {
//         iterScore = score;
//         iterBest = move;
//         alpha = score;
//       }
//     }

//     const idx = moves.indexOf(iterBest);
//     if (idx > 0) {
//       moves = [iterBest, ...moves.slice(0, idx), ...moves.slice(idx + 1)];
//     }
//     bestMove = iterBest;
//     console.log(
//       `depth ${depth}: score ${iterScore}, time ${Date.now() - start}ms`,
//     );
//   }

//   return bestMove;
// }
