import { describe, expect, test } from "bun:test";
import { parseFEN } from "$lib/chess/internal/handleFEN";
import { knightMoves } from "$lib/chess/internal/moves/moves.knight";

describe("knightMoves", () => {
  test("generates all 8 moves for a knight in the center", () => {
    const state = parseFEN("8/8/8/3N4/8/8/8/8 w - - 0 1");
    const moves = knightMoves(state, [3, 3]);
    const expected = [
      { from: [3, 3], to: [1, 2] },
      { from: [3, 3], to: [1, 4] },
      { from: [3, 3], to: [2, 1] },
      { from: [3, 3], to: [2, 5] },
      { from: [3, 3], to: [4, 1] },
      { from: [3, 3], to: [4, 5] },
      { from: [3, 3], to: [5, 2] },
      { from: [3, 3], to: [5, 4] },
    ];

    expect(moves).toEqual(expect.arrayContaining(expected));
    expect(moves.length).toBe(8);
  });

  test("generates fewer moves for a knight on the corner", () => {
    const state = parseFEN("N7/8/8/8/8/8/8/8 w - - 0 1");
    const moves = knightMoves(state, [0, 0]);
    const expected = [
      { from: [0, 0], to: [1, 2] },
      { from: [0, 0], to: [2, 1] },
    ];

    expect(moves).toEqual(expect.arrayContaining(expected));
    expect(moves.length).toBe(2);
  });

  test("include moves blocked by enemy pieces", () => {
    const state = parseFEN("8/2p1p3/1p3p2/3N4/1p3p2/2p1p3/8/8 w - - 0 1");
    const moves = knightMoves(state, [3, 3]);
    const expected = [
      { from: [3, 3], to: [1, 2] },
      { from: [3, 3], to: [1, 4] },
      { from: [3, 3], to: [2, 1] },
      { from: [3, 3], to: [2, 5] },
      { from: [3, 3], to: [4, 1] },
      { from: [3, 3], to: [4, 5] },
      { from: [3, 3], to: [5, 2] },
      { from: [3, 3], to: [5, 4] },
    ];

    expect(moves).toEqual(expect.arrayContaining(expected));
    expect(moves.length).toBe(8);
  });

  test("does not include moves blocked by allied pieces", () => {
    const state = parseFEN("8/2P1P3/1P3P2/3N4/1P3P2/2P1P3/8/8 w - - 0 1");
    const moves = knightMoves(state, [3, 3]);

    expect(moves.length).toBe(0);
  });

  test("handles black knights correctly", () => {
    const state = parseFEN("8/8/8/3n4/8/8/8/8 b - - 0 1");
    const moves = knightMoves(state, [3, 3]);
    const expected = [
      { from: [3, 3], to: [1, 2] },
      { from: [3, 3], to: [1, 4] },
      { from: [3, 3], to: [2, 1] },
      { from: [3, 3], to: [2, 5] },
      { from: [3, 3], to: [4, 1] },
      { from: [3, 3], to: [4, 5] },
      { from: [3, 3], to: [5, 2] },
      { from: [3, 3], to: [5, 4] },
    ];

    expect(moves).toEqual(expect.arrayContaining(expected));
    expect(moves.length).toBe(8);
  });
});
