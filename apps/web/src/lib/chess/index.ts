export type {
  Color,
  Piece,
  Board,
  CastlingRights,
  GameState,
  Move,
} from "$lib/chess/internal/types";

export { parseFEN, boardToFEN } from "$lib/chess/internal/board";

export { isCheckmate, isDraw } from "./internal/gameStatus";

export { getLegalMoves } from "$lib/chess/internal/validation";
export { playMove } from "$lib/chess/internal/playMove";

export {
  printBoard,
  algebraicToCoords,
  coordsToAlgebraic,
} from "$lib/chess/internal/utils";
