import { describe, expect, test } from "bun:test";
import { parseFEN } from "$lib/chess/internal/board";
import type { Move } from "$lib/chess/internal/types";
import {
  applyMoveCopy,
  getLegalMoves,
  isCastleLegal,
  isKingInCheck,
} from "$lib/chess/internal/validation";

describe("isKingInCheck", () => {
  test("returns false for an isolated king", () => {
    const state = parseFEN("8/8/8/3K4/8/8/8/8 w - - 0 1");
    expect(isKingInCheck(state, true)).toBe(false);
  });

  test("detects check from a pawn", () => {
    const state = parseFEN("8/8/8/3k4/2P5/8/8/8 w - - 0 1");
    expect(isKingInCheck(state, false)).toBe(true);
  });

  test("detects check from a knight", () => {
    const state = parseFEN("8/8/8/3k4/8/2N5/8/8 w - - 0 1");
    expect(isKingInCheck(state, false)).toBe(true);
  });

  test("detects check from a bishop", () => {
    const state = parseFEN("8/8/8/3k4/8/8/B7/8 w - - 0 1");
    expect(isKingInCheck(state, false)).toBe(true);
  });

  test("detects check from a rook", () => {
    const state = parseFEN("8/8/8/3k4/3R4/8/8/8 w - - 0 1");
    expect(isKingInCheck(state, false)).toBe(true);
  });

  test("detects check from a queen (diagonal)", () => {
    const state = parseFEN("8/8/8/3k4/2Q5/8/8/8 w - - 0 1");
    expect(isKingInCheck(state, false)).toBe(true);
  });

  test("detects check from a queen (line)", () => {
    const state = parseFEN("8/8/8/3k4/3Q4/8/8/8 w - - 0 1");
    expect(isKingInCheck(state, false)).toBe(true);
  });

  test("does not detect check from allied pieces", () => {
    const state = parseFEN("8/8/8/3K4/2Q5/8/8/8 w - - 0 1");
    expect(isKingInCheck(state, true)).toBe(false);
  });

  test("detects check from multiple pieces", () => {
    const state = parseFEN("8/8/8/3k4/2Q1B3/8/8/8 w - - 0 1");
    expect(isKingInCheck(state, false)).toBe(true);
  });

  test("detects check from black pieces on white king", () => {
    const state = parseFEN("8/8/8/3K4/2q5/8/8/8 b - - 0 1");
    expect(isKingInCheck(state, true)).toBe(true);
  });

  test("king in corner attacked by rook", () => {
    const state = parseFEN("k7/8/8/8/8/8/8/R7 w - - 0 1");
    expect(isKingInCheck(state, false)).toBe(true);
  });

  test("king in corner not attacked", () => {
    const state = parseFEN("k7/8/8/8/8/2Q5/8/8 w - - 0 1");
    expect(isKingInCheck(state, true)).toBe(false);
  });

  test("white king in front of pawn", () => {
    const state = parseFEN("8/8/8/8/3p4/3K4/8/8 b - - 0 1");
    expect(isKingInCheck(state, true)).toBe(false);
  });

  test("king surrounded but safe", () => {
    const state = parseFEN("8/8/8/3K4/3P4/3q4/8/8 w - - 0 1");
    expect(isKingInCheck(state, true)).toBe(false);
  });

  test("king too close to other king", () => {
    const state = parseFEN("8/8/8/3K4/4k3/8/8/8 w - - 0 1");
    expect(isKingInCheck(state, true)).toBe(true);
  });

  test("initial game position", () => {
    const state = parseFEN(
      "rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1",
    );
    expect(isKingInCheck(state, true)).toBe(false);
  });
});

describe("isCastleLegal", () => {
  test("allows white king side castle in empty position", () => {
    const state = parseFEN("8/8/8/8/8/8/8/R3K2R w KQkq - 0 1");
    const move: Move = { from: [7, 4], to: [7, 6], castle: "king" };

    expect(isCastleLegal(state, move)).toBe(true);
  });

  test("allows white queen side castle", () => {
    const state = parseFEN("8/8/8/8/8/8/8/R3K2R w KQkq - 0 1");
    const move: Move = { from: [7, 4], to: [7, 2], castle: "queen" };

    expect(isCastleLegal(state, move)).toBe(true);
  });

  test("disallows castling if king is in check", () => {
    const state = parseFEN("8/8/8/8/8/8/4r3/R3K2R w KQkq - 0 1");
    const move: Move = { from: [7, 4], to: [7, 6], castle: "king" };

    expect(isCastleLegal(state, move)).toBe(false);
  });

  test("disallows castling through check", () => {
    const state = parseFEN("8/8/8/8/8/8/5r2/R3K2R w KQkq - 0 1");
    const move: Move = { from: [7, 4], to: [7, 6], castle: "king" };

    expect(isCastleLegal(state, move)).toBe(false);
  });

  test("disallows castling into check", () => {
    const state = parseFEN("8/8/8/8/8/8/6r1/R3K2R w KQkq - 0 1");
    const move: Move = { from: [7, 4], to: [7, 6], castle: "king" };

    expect(isCastleLegal(state, move)).toBe(false);
  });

  test("disallows queen side castle through check", () => {
    const state = parseFEN("8/8/8/8/8/8/3r4/R3K2R w KQkq - 0 1");
    const move: Move = { from: [7, 4], to: [7, 2], castle: "queen" };

    expect(isCastleLegal(state, move)).toBe(false);
  });

  test("allows black king side castle", () => {
    const state = parseFEN("r3k2r/8/8/8/8/8/8/8 b KQkq - 0 1");
    const move: Move = { from: [0, 4], to: [0, 6], castle: "king" };

    expect(isCastleLegal(state, move)).toBe(true);
  });

  test("allows black queen side castle", () => {
    const state = parseFEN("r3k2r/8/8/8/8/8/8/8 b KQkq - 0 1");
    const move: Move = { from: [0, 4], to: [0, 2], castle: "queen" };

    expect(isCastleLegal(state, move)).toBe(true);
  });

  test("disallows black castling through attacked square", () => {
    const state = parseFEN("r3k2r/8/8/8/8/8/8/R4R2 b KQkq - 0 1");
    const move: Move = { from: [0, 4], to: [0, 6], castle: "king" };

    expect(isCastleLegal(state, move)).toBe(false);
  });
});

describe("applyMoveCopy", () => {
  test("moves a piece normally", () => {
    const state = parseFEN("8/8/8/8/8/8/8/R3K2R w KQkq - 0 1");
    const move: Move = { from: [7, 0], to: [5, 0] };
    const newState = applyMoveCopy(state, move);

    expect(newState.board[5][0]).toBe("R");
    expect(newState.board[7][0]).toBe(null);
  });

  test("handles captures correctly", () => {
    const state = parseFEN("8/8/8/3p4/8/8/8/3K4 w - - 0 1");
    const move: Move = { from: [7, 3], to: [3, 3] };
    const newState = applyMoveCopy(state, move);

    expect(newState.board[3][3]).toBe("K");
    expect(newState.board[7][3]).toBe(null);
  });

  test("applies promotion if present", () => {
    const state = parseFEN("8/P7/8/8/8/8/8/8 w - - 0 1");
    const move: Move = { from: [1, 0], to: [0, 0], promotion: "Q" };
    const newState = applyMoveCopy(state, move);

    expect(newState.board[0][0]).toBe("Q");
    expect(newState.board[1][0]).toBe(null);
  });

  test("moves king-side castle correctly", () => {
    const state = parseFEN("8/8/8/8/8/8/8/R3K2R w KQkq - 0 1");
    const move: Move = { from: [7, 4], to: [7, 6], castle: "king" };
    const newState = applyMoveCopy(state, move);

    expect(newState.board[7][6]).toBe("K");
    expect(newState.board[7][4]).toBe(null);
    expect(newState.board[7][5]).toBe("R");
    expect(newState.board[7][7]).toBe(null);
  });

  test("moves queen-side castle correctly", () => {
    const state = parseFEN("r3k2r/8/8/8/8/8/8/R3K2R w KQkq - 0 1");
    const move: Move = { from: [7, 4], to: [7, 2], castle: "queen" };
    const newState = applyMoveCopy(state, move);

    expect(newState.board[7][2]).toBe("K");
    expect(newState.board[7][4]).toBe(null);
    expect(newState.board[7][3]).toBe("R");
    expect(newState.board[7][0]).toBe(null);
  });

  test("handles en passant correctly", () => {
    const state = parseFEN("8/8/8/3pP3/8/8/8/8 w - d6 0 1");
    const move: Move = { from: [3, 4], to: [2, 3] };
    const newState = applyMoveCopy(state, move);

    expect(newState.board[2][3]).toBe("P");
    expect(newState.board[3][4]).toBe(null);
    expect(newState.board[3][3]).toBe(null);
  });
});

describe("getLegalMoves", () => {
  test("returns all legal pawn moves including captures", () => {
    const state = parseFEN("8/8/8/3p4/2P5/8/8/8 w - d6 0 1");
    const moves = getLegalMoves(state, [4, 2]).map(({ from, to }) => ({
      from,
      to,
    }));

    const expected = [
      { from: [4, 2], to: [3, 2] },
      { from: [4, 2], to: [3, 3] },
    ];

    expect(moves).toEqual(expect.arrayContaining(expected));
    expect(moves.length).toBe(2);
  });

  test("returns legal pinned knight moves", () => {
    const state = parseFEN("8/8/8/8/2q1N1K1/8/8/8 w - - 0 1");
    const moves = getLegalMoves(state, [4, 3]);

    expect(moves.length).toBe(0);
  });

  test("prevents moving pinned pieces", () => {
    const state = parseFEN("4q3/8/8/8/3R4/8/8/4K3 w - - 0 1");
    const moves = getLegalMoves(state, [4, 3]).map(({ from, to }) => ({
      from,
      to,
    }));

    expect(moves).toEqual([{ from: [4, 3], to: [4, 4] }]);
  });

  test("returns legal bishop moves", () => {
    const state = parseFEN("8/8/8/8/4B3/8/8/8 w - - 0 1");
    const moves = getLegalMoves(state, [4, 4]).map(({ from, to }) => ({
      from,
      to,
    }));

    const expected = [
      { from: [4, 4], to: [3, 3] },
      { from: [4, 4], to: [2, 2] },
      { from: [4, 4], to: [1, 1] },
      { from: [4, 4], to: [0, 0] },
      { from: [4, 4], to: [3, 5] },
      { from: [4, 4], to: [2, 6] },
      { from: [4, 4], to: [1, 7] },
      { from: [4, 4], to: [5, 3] },
      { from: [4, 4], to: [6, 2] },
      { from: [4, 4], to: [7, 1] },
      { from: [4, 4], to: [5, 5] },
      { from: [4, 4], to: [6, 6] },
      { from: [4, 4], to: [7, 7] },
    ];

    expect(moves).toEqual(expect.arrayContaining(expected));
    expect(moves.length).toBe(13);
  });

  test("returns legal king moves including king-side castling", () => {
    const state = parseFEN("2r5/8/8/8/8/8/8/R3K2R w KQkq - 0 1");
    const moves = getLegalMoves(state, [7, 4]);

    expect(moves.some((m) => m.castle === "king")).toBe(true);
    expect(moves.some((m) => m.castle === "queen")).toBe(false);
  });

  test("does not allow moves putting king in check", () => {
    const state = parseFEN("4k3/8/8/8/3R4/8/8/4K3 w - - 0 1");
    const moves = getLegalMoves(state, [0, 4]);

    expect(moves.some((m) => m.to[0] === 7 && m.to[1] === 3)).toBe(false);
  });
});
