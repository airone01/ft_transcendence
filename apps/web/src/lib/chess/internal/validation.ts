import { bishopMoves } from "$lib/chess/internal/moves/moves.bishop";
import { kingMoves } from "$lib/chess/internal/moves/moves.king";
import { knightMoves } from "$lib/chess/internal/moves/moves.knight";
import { pawnMoves } from "$lib/chess/internal/moves/moves.pawn";
import { queenMoves } from "$lib/chess/internal/moves/moves.queen";
import { rookMoves } from "$lib/chess/internal/moves/moves.rook";
import type { GameState, Move } from "$lib/chess/internal/types";
import { isInBoard } from "$lib/chess/internal/utils";
import { InvalidMove } from "./errors";

/**
 * Returns all legal moves for the given piece.
 *
 * @param state The current game state
 * @param from The coordinates of the piece to get moves for
 * @returns An array of legal moves for the given piece
 */
export function getLegalMoves(
  state: GameState,
  from: [number, number],
): Move[] {
  const piece = state.board[from[0]][from[1]];
  if (!piece) return [];

  let pseudoMoves: Move[] = [];

  switch (piece.toLowerCase()) {
    case "p":
      pseudoMoves = pawnMoves(state, from);
      break;
    case "n":
      pseudoMoves = knightMoves(state, from);
      break;
    case "b":
      pseudoMoves = bishopMoves(state, from);
      break;
    case "r":
      pseudoMoves = rookMoves(state, from);
      break;
    case "q":
      pseudoMoves = queenMoves(state, from);
      break;
    case "k":
      pseudoMoves = kingMoves(state, from);
      break;
  }

  return pseudoMoves.filter((move) => isLegalMove(state, move));
}

/** @internal */
export function isLegalMove(state: GameState, move: Move): boolean {
  const piece = state.board[move.from[0]][move.from[1]];
  if (!piece) return false;

  if (piece === piece.toUpperCase() && state.turn === "b") return false;
  if (piece === piece.toLowerCase() && state.turn === "w") return false;

  if (move.castle) return isCastleLegal(state, move);

  const newState = applyMoveCopy(state, move);
  const isWhite = piece === piece.toUpperCase();

  return !isKingInCheck(newState, isWhite);
}

/** @internal */
export function isCastleLegal(state: GameState, move: Move): boolean {
  const piece = state.board[move.from[0]][move.from[1]];

  if (!piece) return false;

  const isWhite = piece === piece.toUpperCase();
  const row = isWhite ? 7 : 0;

  if (isKingInCheck(state, isWhite)) return false;

  const middleCol = move.castle === "king" ? 5 : 3;
  const stateMiddleMove = simulateKingStep(state, [row, 4], [row, middleCol]);
  if (isKingInCheck(stateMiddleMove, isWhite)) return false;

  const endCol = move.castle === "king" ? 6 : 2;
  const stateFinalMove = simulateKingStep(state, [row, 4], [row, endCol]);
  if (isKingInCheck(stateFinalMove, isWhite)) return false;

  return true;
}

function simulateKingStep(
  state: GameState,
  from: [number, number],
  to: [number, number],
): GameState {
  const board = state.board.map((r) => [...r]);
  board[to[0]][to[1]] = board[from[0]][from[1]];
  board[from[0]][from[1]] = null;

  return { ...state, board };
}

/** @internal */
export function applyMoveCopy(state: GameState, move: Move): GameState {
  const newBoard = state.board.map((row) => [...row]) as GameState["board"];
  const newCastling = { ...state.castling };
  const newEnPassant = state.enPassant;

  const [fr, fc] = move.from;
  const [tr, tc] = move.to;

  const piece = newBoard[fr][fc];
  if (!piece) throw new InvalidMove();

  if (state.board[tr][tc]) move.capture = true;

  // Move
  newBoard[tr][tc] = move.promotion ?? piece;
  newBoard[fr][fc] = null;

  // Castle
  if (move.castle) {
    if (move.castle === "king") {
      newBoard[tr][tc - 1] = newBoard[tr][7];
      newBoard[tr][7] = null;
    } else if (move.castle === "queen") {
      newBoard[tr][tc + 1] = newBoard[tr][0];
      newBoard[tr][0] = null;
    }
  }

  // Roque rights
  if (piece.toLowerCase() === "k") {
    if (piece === "K") {
      newCastling.whiteKingSide = false;
      newCastling.whiteQueenSide = false;
    } else {
      newCastling.blackKingSide = false;
      newCastling.blackQueenSide = false;
    }
  } else if (piece.toLowerCase() === "r") {
    if (fr === 7 && fc === 7) newCastling.whiteKingSide = false;
    if (fr === 7 && fc === 0) newCastling.whiteQueenSide = false;
    if (fr === 0 && fc === 7) newCastling.blackKingSide = false;
    if (fr === 0 && fc === 0) newCastling.blackQueenSide = false;
  } else if (state.board[tr][tc]?.toLowerCase() === "r") {
    if (tr === 7 && tc === 7) newCastling.whiteKingSide = false;
    if (tr === 7 && tc === 0) newCastling.whiteQueenSide = false;
    if (tr === 0 && tc === 7) newCastling.blackKingSide = false;
    if (tr === 0 && tc === 0) newCastling.blackQueenSide = false;
  }

  // En passant
  if (piece.toLowerCase() === "p" && state.enPassant) {
    const [epr, epc] = state.enPassant;
    if (epr === tr && epc === tc) {
      const dir = piece === piece.toUpperCase() ? 1 : -1;
      newBoard[tr + dir][tc] = null;
    }
  }

  return {
    ...state,
    board: newBoard,
    castling: newCastling,
    enPassant: newEnPassant,
    historyFEN: state.historyFEN,
  };
}

/** @internal */
export function isKingInCheck(state: GameState, isWhite: boolean): boolean {
  const [kr, kc] = findKingPos(state, isWhite);

  for (let r = 0; r < 8; r++) {
    for (let c = 0; c < 8; c++) {
      const piece = state.board[r][c];
      if (!piece) continue;

      const pieceIsWhite = piece === piece.toUpperCase();
      if (pieceIsWhite === isWhite) continue;

      const from: [number, number] = [r, c];
      let moves: { to: [number, number] }[] = [];

      switch (piece.toLowerCase()) {
        case "p": {
          const dir = pieceIsWhite ? -1 : 1;
          const attackSquares: [number, number][] = [
            [r + dir, c - 1],
            [r + dir, c + 1],
          ];
          moves = attackSquares
            .filter(([rr, cc]) => isInBoard([rr, cc]))
            .map((to) => ({ to }));
          break;
        }
        case "n":
          moves = knightMoves(state, from);
          break;
        case "b":
          moves = bishopMoves(state, from);
          break;
        case "r":
          moves = rookMoves(state, from);
          break;
        case "q":
          moves = queenMoves(state, from);
          break;
        case "k":
          moves = kingMoves(state, from).filter((m) => !m.castle);
          break;
      }

      if (moves.some((m) => m.to[0] === kr && m.to[1] === kc)) {
        return true;
      }
    }
  }

  return false;
}

function findKingPos(state: GameState, isWhite: boolean): [number, number] {
  let kingPos: [number, number] = [0, 0];

  for (let r = 0; r < 8; r++) {
    for (let c = 0; c < 8; c++) {
      const piece = state.board[r][c];
      if (piece && ((isWhite && piece === "K") || (!isWhite && piece === "k")))
        kingPos = [r, c];
    }
  }

  return kingPos;
}
