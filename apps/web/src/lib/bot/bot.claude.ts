import {
  applyMoveForSearch,
  isCheckmate,
  type Board,
  type Color,
  type GameState,
  type Move,
} from "$lib/chess";
import { getAllLegalMoves } from "$lib/chess/internal/gameEndChecks";

// ── Piece-square tables (white perspective; mirror with 7-r for black) ──

const pawnTable = [
  [0, 0, 0, 0, 0, 0, 0, 0],
  [50, 50, 50, 50, 50, 50, 50, 50],
  [10, 10, 20, 30, 30, 20, 10, 10],
  [5, 5, 10, 25, 25, 10, 5, 5],
  [0, 0, 0, 20, 20, 0, 0, 0],
  [5, -5, -10, 0, 0, -10, -5, 5],
  [5, 10, 10, -20, -20, 10, 10, 5],
  [0, 0, 0, 0, 0, 0, 0, 0],
];

const knightTable = [
  [-50, -40, -30, -30, -30, -30, -40, -50],
  [-40, -20, 0, 0, 0, 0, -20, -40],
  [-30, 0, 10, 15, 15, 10, 0, -30],
  [-30, 5, 15, 20, 20, 15, 5, -30],
  [-30, 0, 15, 20, 20, 15, 0, -30],
  [-30, 5, 10, 15, 15, 10, 5, -30],
  [-40, -20, 0, 5, 5, 0, -20, -40],
  [-50, -40, -30, -30, -30, -30, -40, -50],
];

const bishopTable = [
  [-20, -10, -10, -10, -10, -10, -10, -20],
  [-10, 0, 0, 0, 0, 0, 0, -10],
  [-10, 0, 5, 10, 10, 5, 0, -10],
  [-10, 5, 5, 10, 10, 5, 5, -10],
  [-10, 0, 10, 10, 10, 10, 0, -10],
  [-10, 10, 10, 10, 10, 10, 10, -10],
  [-10, 5, 0, 0, 0, 0, 5, -10],
  [-20, -10, -10, -10, -10, -10, -10, -20],
];

const rookTable = [
  [0, 0, 0, 0, 0, 0, 0, 0],
  [5, 10, 10, 10, 10, 10, 10, 5],
  [-5, 0, 0, 0, 0, 0, 0, -5],
  [-5, 0, 0, 0, 0, 0, 0, -5],
  [-5, 0, 0, 0, 0, 0, 0, -5],
  [-5, 0, 0, 0, 0, 0, 0, -5],
  [-5, 0, 0, 0, 0, 0, 0, -5],
  [0, 0, 0, 5, 5, 0, 0, 0],
];

const queenTable = [
  [-20, -10, -10, -5, -5, -10, -10, -20],
  [-10, 0, 0, 0, 0, 0, 0, -10],
  [-10, 0, 5, 5, 5, 5, 0, -10],
  [-5, 0, 5, 5, 5, 5, 0, -5],
  [0, 0, 5, 5, 5, 5, 0, -5],
  [-10, 5, 5, 5, 5, 5, 0, -10],
  [-10, 0, 5, 0, 0, 0, 0, -10],
  [-20, -10, -10, -5, -5, -10, -10, -20],
];

const kingMiddleGameTable = [
  [-30, -40, -40, -50, -50, -40, -40, -30],
  [-30, -40, -40, -50, -50, -40, -40, -30],
  [-30, -40, -40, -50, -50, -40, -40, -30],
  [-30, -40, -40, -50, -50, -40, -40, -30],
  [-20, -30, -30, -40, -40, -30, -30, -20],
  [-10, -20, -20, -20, -20, -20, -20, -10],
  [20, 20, 0, 0, 0, 0, 20, 20],
  [20, 30, 10, 0, 0, 10, 30, 20],
];

const kingEndGameTable = [
  [-50, -40, -30, -20, -20, -30, -40, -50],
  [-30, -20, -10, 0, 0, -10, -20, -30],
  [-30, -10, 20, 30, 30, 20, -10, -30],
  [-30, -10, 30, 40, 40, 30, -10, -30],
  [-30, -10, 30, 40, 40, 30, -10, -30],
  [-30, -10, 20, 30, 30, 20, -10, -30],
  [-30, -30, 0, 0, 0, 0, -30, -30],
  [-50, -30, -30, -30, -30, -30, -30, -50],
];

const pieceTables: Record<string, number[][]> = {
  P: pawnTable,
  N: knightTable,
  B: bishopTable,
  R: rookTable,
  Q: queenTable,
};

const pieceValues: Record<string, number> = {
  P: 100,
  N: 320,
  B: 330,
  R: 500,
  Q: 900,
  K: 20000,
};

// ── Helpers ──────────────────────────────────────────────────────────────
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

// ── Evaluation ───────────────────────────────────────────────────────────
// Bonuses for having both bishops (bishop pair is strong)
const BISHOP_PAIR_BONUS = 50;
// Penalty for doubled pawns (two pawns on same file)
const DOUBLED_PAWN_PENALTY = -20;
// Penalty for isolated pawns (no friendly pawns on adjacent files)
const ISOLATED_PAWN_PENALTY = -15;
// Bonus for pawn protection of another pawn
const CONNECTED_PAWN_BONUS = 10;
// Bonus for rook on open file (no pawns)
const ROOK_OPEN_FILE_BONUS = 25;
// Bonus for rook on semi-open file (no friendly pawns)
const ROOK_SEMI_OPEN_FILE_BONUS = 10;
// Mobility bonus per available move
const MOBILITY_BONUS = 2;

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

    // Doubled pawns: another pawn on same file
    if (pawnCols.filter((c) => c === col).length > 1) {
      score += DOUBLED_PAWN_PENALTY;
    }

    // Isolated pawns: no friendly pawns on adjacent files
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
  const { board } = state;
  const eg = isEndGame(board);
  let score = 0;

  // Material + positional
  for (let r = 0; r < 8; r++) {
    for (let c = 0; c < 8; c++) {
      const piece = board[r][c];
      if (!piece) continue;
      const pc = getPieceColor(piece);
      const type = piece.toUpperCase();
      const sign = pc === color ? 1 : -1;
      score += sign * pieceValues[type];
      const table =
        type === "K"
          ? eg
            ? kingEndGameTable
            : kingMiddleGameTable
          : pieceTables[type];
      if (table) score += sign * table[pc === "w" ? r : 7 - r][c];
    }
  }

  // Pawn structure
  score +=
    evaluatePawns(board, color) -
    evaluatePawns(board, color === "w" ? "b" : "w");
  // Rook files
  score +=
    evaluateRooks(board, color) -
    evaluateRooks(board, color === "w" ? "b" : "w");
  // Bishop pair
  score +=
    evaluateBishops(board, color) -
    evaluateBishops(board, color === "w" ? "b" : "w");

  return score;
}

// ── Move ordering ─────────────────────────────────────────────────────────
function scoreMoveForOrdering(move: Move, board: Board): number {
  let score = 0;
  if (move.capture) {
    const attacker = board[move.from[0]][move.from[1]];
    const victim = board[move.to[0]][move.to[1]];
    if (attacker && victim)
      score +=
        10 * pieceValues[victim.toUpperCase()] -
        pieceValues[attacker.toUpperCase()];
  }
  if (move.promotion) score += pieceValues[move.promotion.toUpperCase()];
  return score;
}
function orderMoves(moves: Move[], board: Board): Move[] {
  return moves
    .map((m) => ({ m, s: scoreMoveForOrdering(m, board) }))
    .sort((a, b) => b.s - a.s)
    .map((x) => x.m);
}

// ── Search ───────────────────────────────────────────────────────────────
let nodeCount = 0;
let qNodeCount = 0;

function negamax(
  state: GameState,
  sharedHistory: string[],
  color: Color,
  alpha: number,
  beta: number,
  depth: number,
): number {
  nodeCount++;
  if (state.halfMoveCount >= 100) return 0;

  const moves = getAllLegalMoves(state);
  if (moves.length === 0) return isCheckmate(state) ? -1_000_000 : 0;
  if (depth === 0)
    return quiescence(state, sharedHistory, color, alpha, beta, moves);

  for (const move of orderMoves(moves, state.board)) {
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
  qNodeCount++;
  if (state.halfMoveCount >= 100) return 0;

  const moves = existingMoves ?? getAllLegalMoves(state);
  if (moves.length === 0) return isCheckmate(state) ? -1_000_000 : 0;

  const standPat = evaluate(state, color);
  if (standPat >= beta) return beta;
  if (standPat > alpha) alpha = standPat;

  const captures = moves.filter((m) => m.capture);
  for (const move of orderMoves(captures, state.board)) {
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

// ── Entry point ───────────────────────────────────────────────────────────
export function findBestMoveTimed(state: GameState, timeLimitMs: number): Move {
  (globalThis as any).__applyCount = 0;

  const start = Date.now();
  nodeCount = 0;
  qNodeCount = 0;

  let moves = orderMoves(getAllLegalMoves(state), state.board);
  let bestMove = moves[0];
  const sharedHistory = [...state.historyFEN];

  for (let depth = 1; depth <= 10; depth++) {
    if (Date.now() - start > timeLimitMs) break;

    let iterBest = moves[0];
    let iterScore = -Infinity;
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
        -Infinity,
        Infinity,
        depth,
      );
      sharedHistory.pop();

      if (score > iterScore) {
        iterScore = score;
        iterBest = move;
        alpha = score;
      }
    }

    const idx = moves.indexOf(iterBest);
    if (idx > 0) {
      moves = [iterBest, ...moves.slice(0, idx), ...moves.slice(idx + 1)];
    }
    bestMove = iterBest;
    console.log(
      `depth ${depth}: score ${iterScore}, ` +
        `${nodeCount} nodes + ${qNodeCount} q-nodes, ` +
        `time ${Date.now() - start}ms`,
    );
  }

  return bestMove;
}
