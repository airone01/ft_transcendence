import { parseFEN } from "./handleFEN";
import type { GameState, Piece } from "./types";

/**
 * Starts a new chess game.
 * @return {GameState} The starting state of the chess game.
 */
export function startGame(): GameState {
  const startingFEN =
    "rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1";

  const state = parseFEN(startingFEN);
  state.historyFEN.push(startingFEN);

  return state;
}

/**
 * Prints a chess board to the console.
 * @param {Piece[][]} board - an 8x8 array representing the chess board.
 * Each element in the array should be either null (representing an empty square) or a string representing a chess piece.
 */
export function printBoard(board: Piece[][]) {
  const columns = "  a b c d e f g h".split(" ");
  const rows = "8 7 6 5 4 3 2 1".split(" ");
  console.log(columns.join(" "));
  console.log(
    board
      .map((r, i) => `${`${rows[i]} ${r.map((c) => c ?? ".").join(" ")}`}`)
      .join("\n"),
  );
}

/**
 * Prints a chess game history to the console.
 * @param {string[]} history - an array of strings, where each string represents a move in the chess game.
 * The strings will be joined with newlines and printed to the console.
 */
export function printHistory(history: string[]) {
  console.log(history.join("\n"));
}

/**
 * Converts an algebraic position string into a pair of coordinates (row, col).
 * The algebraic position string is a string of length 2, where the first character is the column (a-h) and the second character is the row (1-8).
 * @example algebraicToCoords("a1") returns [0, 0].
 * @param pos The algebraic position string.
 * @return The coordinates [row, col].
 */
export function algebraicToCoords(pos: string): [number, number] {
  const col = pos.charCodeAt(0) - "a".charCodeAt(0);
  const row = 8 - parseInt(pos[1], 10);
  return [row, col];
}

/**
 * Converts a pair of coordinates (row, col) into an algebraic position string (e.g. "a1", "h8").
 * @param row The row of the board (0-7).
 * @param col The column of the board (0-7).
 * @return The algebraic position string.
 */
export function coordsToAlgebraic([row, col]: [number, number]): string {
  return String.fromCharCode(col + "a".charCodeAt(0)) + (8 - row);
}

/** @internal */
export function isInBoard([row, col]: [number, number]): boolean {
  return row >= 0 && row < 8 && col >= 0 && col < 8;
}
