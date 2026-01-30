import { describe, test, expect } from "bun:test";
import { parseFEN } from "$lib/chess/internal/board";
import { rookMoves } from "$lib/chess/internal/moves.rook";

describe("rookMoves", () => {
  test("generates all horizontal and vertical moves from center", () => {
    const state = parseFEN("8/8/8/3R4/8/8/8/8 w - - 0 1");
    const moves = rookMoves(state, [3, 3]);

    const expected = [
      { from: [3, 3], to: [3, 0] },
      { from: [3, 3], to: [3, 1] },
      { from: [3, 3], to: [3, 2] },
      { from: [3, 3], to: [3, 4] },
      { from: [3, 3], to: [3, 5] },
      { from: [3, 3], to: [3, 6] },
      { from: [3, 3], to: [3, 7] },
      { from: [3, 3], to: [0, 3] },
      { from: [3, 3], to: [1, 3] },
      { from: [3, 3], to: [2, 3] },
      { from: [3, 3], to: [4, 3] },
      { from: [3, 3], to: [5, 3] },
      { from: [3, 3], to: [6, 3] },
      { from: [3, 3], to: [7, 3] },
    ];

    expect(moves).toEqual(expect.arrayContaining(expected));
    expect(moves.length).toBe(14);
  });

  test("generates limited moves from corner", () => {
    const state = parseFEN("R7/8/8/8/8/8/8/8 w - - 0 1");
    const moves = rookMoves(state, [0, 0]);

    const expected = [
      { from: [0, 0], to: [0, 1] },
      { from: [0, 0], to: [0, 2] },
      { from: [0, 0], to: [0, 3] },
      { from: [0, 0], to: [0, 4] },
      { from: [0, 0], to: [0, 5] },
      { from: [0, 0], to: [0, 6] },
      { from: [0, 0], to: [0, 7] },
      { from: [0, 0], to: [1, 0] },
      { from: [0, 0], to: [2, 0] },
      { from: [0, 0], to: [3, 0] },
      { from: [0, 0], to: [4, 0] },
      { from: [0, 0], to: [5, 0] },
      { from: [0, 0], to: [6, 0] },
      { from: [0, 0], to: [7, 0] },
    ];

    expect(moves).toEqual(expect.arrayContaining(expected));
    expect(moves.length).toBe(14);
  });

  test("blocked by allied piece", () => {
    const state = parseFEN("8/8/8/3R1P2/8/8/8/8 w - - 0 1");
    const moves = rookMoves(state, [3, 3]);

    expect(moves).toContainEqual({ from: [3, 3], to: [3, 4] });
    expect(moves).not.toContainEqual({ from: [3, 3], to: [3, 5] });
    expect(moves.length).toBe(11);
  });

  test("can capture enemy piece but not beyond", () => {
    const state = parseFEN("8/8/8/3R1p2/8/8/8/8 w - - 0 1");
    const moves = rookMoves(state, [3, 3]);

    expect(moves).toContainEqual({ from: [3, 3], to: [3, 5] });
    expect(moves).not.toContainEqual({ from: [3, 3], to: [3, 6] });
    expect(moves.length).toBe(12);
  });

  test("handles black rook", () => {
    const state = parseFEN("8/8/8/3r4/8/8/8/8 b - - 0 1");
    const moves = rookMoves(state, [3, 3]);

    expect(rookMoves(state, [3, 3]).length).toBe(14);
  });
});
