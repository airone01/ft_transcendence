import type { Board, Color, GameState } from "$lib/chess";
import {
  kingEndGameTable,
  kingMiddleGameTable,
  pieceTables,
  pieceValues,
} from "./values";

function getPieceColor(piece: string): Color {
  return piece.toUpperCase() === piece ? "w" : "b";
}

function isEndGame(board: Board): boolean {
  let queens = 0,
    minors = 0;
  for (const row of board)
    for (const p of row) {
      if (!p) continue;
      if (p.toUpperCase() === "Q") queens++;
      if ("RNB".includes(p.toUpperCase())) minors++;
    }
  return queens === 0 || minors <= 4;
}

const CONNECTED_PAWN_BONUS = 10;
const ISOLATED_PAWN_PENALTY = -15;
const DOUBLED_PAWN_PENALTY = -20;
const BISHOP_PAIR_BONUS = 50;
const ROOK_OPEN_FILE_BONUS = 25;
const ROOK_SEMI_OPEN_FILE_BONUS = 10;

function evaluatePawns(board: Board, color: Color): number {
  let score = 0;
  const pawnCols: number[] = [];

  for (let r = 0; r < 8; r++) {
    for (let c = 0; c < 8; c++) {
      const piece = board[r][c];
      if (!piece || piece.toUpperCase() !== "P") continue;
      if (getPieceColor(piece) !== color) continue;

      pawnCols.push(c);
    }
  }

  for (let i = 0; i < pawnCols.length; i++) {
    const col = pawnCols[i];

    if (pawnCols.filter((c) => c === col).length > 1)
      score += DOUBLED_PAWN_PENALTY;

    const hasNeighbor = pawnCols.some((c) => c === col - 1 || c === col + 1);
    if (!hasNeighbor) {
      score += ISOLATED_PAWN_PENALTY;
    } else {
      score += CONNECTED_PAWN_BONUS;
    }
  }

  return score;
}

function evaluateRooks(board: Board, color: Color): number {
  let score = 0;

  for (let r = 0; r < 8; r++) {
    for (let c = 0; c < 8; c++) {
      const piece = board[r][c];
      if (!piece || piece.toUpperCase() !== "R") continue;
      if (getPieceColor(piece) !== color) continue;

      let hasFriendlyPawn = false;
      let hasEnemyPawn = false;

      for (let row = 0; row < 8; row++) {
        const filePiece = board[row][c];
        if (!filePiece || filePiece.toUpperCase() !== "P") continue;

        if (getPieceColor(filePiece) === color) hasFriendlyPawn = true;
        else hasEnemyPawn = true;
      }

      if (!hasFriendlyPawn && !hasEnemyPawn) score += ROOK_OPEN_FILE_BONUS;
      else if (!hasFriendlyPawn) score += ROOK_SEMI_OPEN_FILE_BONUS;
    }
  }

  return score;
}

function evaluateBishops(board: Board, color: Color): number {
  let count = 0;

  for (const row of board) {
    for (const piece of row) {
      if (
        piece &&
        piece.toUpperCase() === "B" &&
        getPieceColor(piece) === color
      )
        count++;
    }
  }

  return count >= 2 ? BISHOP_PAIR_BONUS : 0;
}

export function evaluate(state: GameState, color: Color): number {
  const board = state.board;
  const endGame = isEndGame(board);
  let score = 0;

  for (let r = 0; r < 8; r++) {
    for (let c = 0; c < 8; c++) {
      const piece = board[r][c];
      if (!piece) continue;

      const pieceColor = getPieceColor(piece);
      const type = piece.toUpperCase();
      const sign = pieceColor === color ? 1 : -1;

      score += sign * pieceValues[type];

      let table: number[][];
      if (type === "K")
        table = endGame ? kingEndGameTable : kingMiddleGameTable;
      else table = pieceTables[type];

      if (table) score += sign * table[pieceColor === "w" ? r : 7 - r][c];
    }
  }

  score +=
    evaluatePawns(board, color) -
    evaluatePawns(board, color === "w" ? "b" : "w");

  score +=
    evaluateRooks(board, color) -
    evaluateRooks(board, color === "w" ? "b" : "w");

  score +=
    evaluateBishops(board, color) -
    evaluateBishops(board, color === "w" ? "b" : "w");

  return score;
}
