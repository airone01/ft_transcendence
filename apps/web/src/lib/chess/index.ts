/* Public API */

/* Errors */
export { EndGame, InvalidMove } from "$lib/chess/internal/errors";

/* FEN related functions */
export { boardToFEN, parseFEN } from "$lib/chess/internal/handleFEN";

/* Move related functions */
export { playMove } from "$lib/chess/internal/playMove";

/* Types */
export type {
  Board,
  CastlingRights,
  Color,
  GameState,
  Move,
  Piece,
} from "$lib/chess/internal/types";

/* Utils */
export {
  algebraicToCoords,
  coordsToAlgebraic,
  printBoard,
  printHistory,
  startGame,
} from "$lib/chess/internal/utils";

/* Validation */
export { getLegalMoves } from "$lib/chess/internal/validation";
export { isCheckmate, isDraw } from "./internal/gameEndChecks";
