/* Public API */

/* FEN related functions */
export { boardToFEN, parseFEN } from "$lib/chess/internal/board";
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
} from "$lib/chess/internal/utils";

/* Validation */
export { getLegalMoves } from "$lib/chess/internal/validation";
export { isCheckmate, isDraw } from "./internal/gameStatus";
