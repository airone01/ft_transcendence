import type {
  Board,
  CastlingRights,
  Color,
  GameState,
} from "$lib/chess/internal/types";
import {
  algebraicToCoords,
  coordsToAlgebraic,
} from "$lib/chess/internal/utils";

/**
 * Parse a FEN string into a GameState object.
 *
 * The FEN string should be in the standard format, e.g.
 * "rnbqkbnr/pppppppp/8/8/4P3/8/PPPP1PPP/RNBQKBNR w KQkq - 0 1"
 *
 * @param fen The FEN string to parse.
 * @return A GameState object representing the parsed FEN string.
 */
export function parseFEN(fen: string): GameState {
  const [
    boardPart,
    turnPart,
    castlingPart,
    enPassantPart,
    halfMoveCount,
    fullMoveCount,
  ] = fen.split(" ");

  const board: Board = boardPart.split("/").map((row) => {
    const squares: (string | null)[] = [];
    for (const char of row) {
      const n = parseInt(char, 10);
      if (Number.isNaN(n)) {
        squares.push(char);
      } else {
        for (let i = 0; i < n; i++) squares.push(null);
      }
    }
    return squares as Board[number];
  });

  const turn: Color = turnPart as Color;

  const castling: CastlingRights = {
    whiteKingSide: castlingPart.includes("K"),
    whiteQueenSide: castlingPart.includes("Q"),
    blackKingSide: castlingPart.includes("k"),
    blackQueenSide: castlingPart.includes("q"),
  };

  const enPassant =
    enPassantPart === "-" ? null : algebraicToCoords(enPassantPart);

  return {
    board,
    turn,
    castling,
    enPassant,
    halfMoveCount: parseInt(halfMoveCount, 10),
    fullMoveCount: parseInt(fullMoveCount, 10),
  };
}

/**
 * Converts a GameState object into a FEN string.
 *
 * @param state The GameState object to convert to a FEN string.
 * @return A FEN string representing the GameState object.
 */
export function boardToFEN(state: GameState): string {
  const boardPart = state.board
    .map((row) => {
      let str = "";
      let empty = 0;
      for (const square of row) {
        if (!square) empty++;
        else {
          if (empty > 0) {
            str += empty;
            empty = 0;
          }
          str += square;
        }
      }
      if (empty > 0) str += empty;
      return str;
    })
    .join("/");

  const turnPart = state.turn;

  const castlingPart =
    (state.castling.whiteKingSide ? "K" : "") +
    (state.castling.whiteQueenSide ? "Q" : "") +
    (state.castling.blackKingSide ? "k" : "") +
    (state.castling.blackQueenSide ? "q" : "");

  const enPassantPart = state.enPassant
    ? coordsToAlgebraic(state.enPassant)
    : "-";

  return [
    boardPart,
    turnPart,
    castlingPart || "-",
    enPassantPart,
    state.halfMoveCount,
    state.fullMoveCount,
  ].join(" ");
}
