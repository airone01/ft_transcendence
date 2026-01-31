import { describe, test, expect } from "bun:test";
import { parseFEN } from "$lib/chess/internal/board";
import {
  normalKingMoves,
  castleMoves,
  kingMoves,
} from "$lib/chess/internal/moves.king";

describe("normalKingMoves", () => {
  test("generates 8 moves from center", () => {
    const state = parseFEN("8/8/8/3K4/8/8/8/8 w - - 0 1");
    const moves = normalKingMoves(state, [3, 3]);

    const expected = [
      { from: [3, 3], to: [2, 2] },
      { from: [3, 3], to: [2, 3] },
      { from: [3, 3], to: [2, 4] },
      { from: [3, 3], to: [3, 2] },
      { from: [3, 3], to: [3, 4] },
      { from: [3, 3], to: [4, 2] },
      { from: [3, 3], to: [4, 3] },
      { from: [3, 3], to: [4, 4] },
    ];

    expect(moves).toEqual(expect.arrayContaining(expected));
    expect(moves.length).toBe(8);
  });

  test("generates 3 moves from corner", () => {
    const state = parseFEN("K7/8/8/8/8/8/8/8 w - - 0 1");
    const moves = normalKingMoves(state, [0, 0]);

    const expected = [
      { from: [0, 0], to: [0, 1] },
      { from: [0, 0], to: [1, 0] },
      { from: [0, 0], to: [1, 1] },
    ];

    expect(moves).toEqual(expect.arrayContaining(expected));
    expect(moves.length).toBe(3);
  });

  test("generates 5 moves from edge", () => {
    const state = parseFEN("8/8/8/K7/8/8/8/8 w - - 0 1");
    const moves = normalKingMoves(state, [3, 0]);

    const expected = [
      { from: [3, 0], to: [2, 0] },
      { from: [3, 0], to: [2, 1] },
      { from: [3, 0], to: [3, 1] },
      { from: [3, 0], to: [4, 0] },
      { from: [3, 0], to: [4, 1] },
    ];

    expect(moves).toEqual(expect.arrayContaining(expected));
    expect(moves.length).toBe(5);
  });

  test("cannot move onto allied piece", () => {
    const state = parseFEN("8/8/8/3K4/3P4/8/8/8 w - - 0 1");
    const moves = normalKingMoves(state, [3, 3]);

    expect(moves).not.toContainEqual({ from: [3, 3], to: [4, 3] });
    expect(moves.length).toBe(7);
  });

  test("can capture enemy piece", () => {
    const state = parseFEN("8/8/8/3K4/3p4/8/8/8 w - - 0 1");
    const moves = normalKingMoves(state, [3, 3]);

    expect(moves).toContainEqual({ from: [3, 3], to: [4, 3] });
    expect(moves.length).toBe(8);
  });

  test("handles black king", () => {
    const state = parseFEN("8/8/8/3k4/8/8/8/8 b - - 0 1");
    const moves = normalKingMoves(state, [3, 3]);

    expect(moves.length).toBe(8);
  });
});

describe("castleMoves", () => {
  test("allows white king-side castle", () => {
    const state = parseFEN("8/8/8/8/8/8/PPPPPPPP/RNBQK2R w KQkq - 0 1");
    const moves = castleMoves(state, [7, 4]);

    expect(moves).toContainEqual({
      from: [7, 4],
      to: [7, 6],
      castle: "king",
    });
    expect(moves.length).toBe(1);
  });

  test("allows white queen-side castle", () => {
    const state = parseFEN("8/8/8/8/8/8/PPPPPPPP/R3KBNR w KQkq - 0 1");
    const moves = castleMoves(state, [7, 4]);

    expect(moves).toContainEqual({
      from: [7, 4],
      to: [7, 2],
      castle: "queen",
    });
    expect(moves.length).toBe(1);
  });

  test("allows black king-side castle", () => {
    const state = parseFEN("rnbqk2r/pppppppp/8/8/8/8/8/8 b KQkq - 0 1");
    const moves = castleMoves(state, [0, 4]);

    expect(moves).toContainEqual({
      from: [0, 4],
      to: [0, 6],
      castle: "king",
    });
    expect(moves.length).toBe(1);
  });

  test("allows black queen-side castle", () => {
    const state = parseFEN("r3kbnr/pppppppp/8/8/8/8/8/8 b KQkq - 0 1");
    const moves = castleMoves(state, [0, 4]);

    expect(moves).toContainEqual({
      from: [0, 4],
      to: [0, 2],
      castle: "queen",
    });
    expect(moves.length).toBe(1);
  });

  test("does not allow castle if path blocked", () => {
    const state = parseFEN(
      "rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKB1R w KQkq - 0 1",
    );
    const moves = castleMoves(state, [7, 4]);

    expect(moves.length).toBe(0);
  });

  test("does not allow castle if no castling rights", () => {
    const state = parseFEN("r3k2r/pppppppp/8/8/8/8/PPPPPPPP/R3K2R w - - 0 1");
    const moves = castleMoves(state, [7, 4]);

    expect(moves.length).toBe(0);
  });

  test("does not allow castle if king not on starting square", () => {
    const state = parseFEN("8/8/8/8/4K3/8/8/R6R w KQ - 0 1");
    const moves = castleMoves(state, [4, 4]);

    expect(moves.length).toBe(0);
  });
});

describe("kingMoves", () => {
  test("includes both normal moves and castle moves", () => {
    const state = parseFEN("8/8/8/8/8/8/PPPP1PPP/RNBQK2R w KQkq - 0 1");
    const moves = kingMoves(state, [7, 4]);

    const expected = [
      { from: [7, 4], to: [6, 4] },
      { from: [7, 4], to: [7, 5] },
      { from: [7, 4], to: [7, 6], castle: "king" },
    ];

    expect(moves).toEqual(expect.arrayContaining(expected));
    expect(moves.length).toBe(3);
  });

  test("does not include castle if path blocked", () => {
    const state = parseFEN("8/8/8/8/8/8/PPP1PPPP/RNB1KB1R w KQkq - 0 1");
    const moves = kingMoves(state, [7, 4]);

    const expected = [
      { from: [7, 4], to: [7, 3] },
      { from: [7, 4], to: [6, 3] },
    ];

    expect(moves).toEqual(expect.arrayContaining(expected));
    expect(moves.length).toBe(2);
  });

  test("does not include castle without rights", () => {
    const state = parseFEN("8/8/8/8/8/8/PPPPPPPP/R3K2R w - - 0 1");
    const moves = kingMoves(state, [7, 4]);

    expect(moves.some((m) => m.castle)).toBe(false);
    expect(moves.length).toBe(2);
  });

  test("handles black king castling", () => {
    const state = parseFEN("rnbqk2r/pppppppp/8/8/8/8/8/8 b KQkq - 0 1");
    const moves = kingMoves(state, [0, 4]);

    expect(moves).toContainEqual({
      from: [0, 4],
      to: [0, 6],
      castle: "king",
    });
  });
});
