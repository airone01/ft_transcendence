import { describe, expect, test } from "bun:test";
import { parseFEN } from "$lib/chess/internal/handleFEN";
import { bishopMoves } from "$lib/chess/internal/moves/moves.bishop";

describe("bishopMoves", () => {
  test("generates diagonal moves from center", () => {
    const state = parseFEN("8/8/8/3B4/8/8/8/8 w - - 0 1");
    const moves = bishopMoves(state, [3, 3]);

    const expected = [
      { from: [3, 3], to: [2, 2] },
      { from: [3, 3], to: [1, 1] },
      { from: [3, 3], to: [0, 0] },
      { from: [3, 3], to: [2, 4] },
      { from: [3, 3], to: [1, 5] },
      { from: [3, 3], to: [0, 6] },
      { from: [3, 3], to: [4, 2] },
      { from: [3, 3], to: [5, 1] },
      { from: [3, 3], to: [6, 0] },
      { from: [3, 3], to: [4, 4] },
      { from: [3, 3], to: [5, 5] },
      { from: [3, 3], to: [6, 6] },
      { from: [3, 3], to: [7, 7] },
    ];

    expect(moves).toEqual(expect.arrayContaining(expected));
    expect(moves.length).toBe(13);
  });

  test("generates limited moves from corner", () => {
    const state = parseFEN("B7/8/8/8/8/8/8/8 w - - 0 1");
    const moves = bishopMoves(state, [0, 0]);

    const expected = [
      { from: [0, 0], to: [1, 1] },
      { from: [0, 0], to: [2, 2] },
      { from: [0, 0], to: [3, 3] },
      { from: [0, 0], to: [4, 4] },
      { from: [0, 0], to: [5, 5] },
      { from: [0, 0], to: [6, 6] },
      { from: [0, 0], to: [7, 7] },
    ];

    expect(moves).toEqual(expect.arrayContaining(expected));
    expect(moves.length).toBe(7);
  });

  test("stops before allied piece", () => {
    const state = parseFEN("8/8/2P5/3B4/8/8/8/8 w - - 0 1");
    const moves = bishopMoves(state, [3, 3]);

    expect(moves).not.toContainEqual({ from: [3, 3], to: [2, 2] });
    expect(moves).not.toContainEqual({ from: [3, 3], to: [1, 1] });
    expect(moves.length).toBe(10);
  });

  test("can capture enemy piece but stops after", () => {
    const state = parseFEN("8/8/2p5/3B4/8/8/8/8 w - - 0 1");
    const moves = bishopMoves(state, [3, 3]);

    expect(moves).toContainEqual({ from: [3, 3], to: [2, 2] });
    expect(moves).not.toContainEqual({ from: [3, 3], to: [1, 1] });
    expect(moves.length).toBe(11);
  });

  test("handles black bishop", () => {
    const state = parseFEN("8/8/8/3b4/8/8/8/8 b - - 0 1");
    const moves = bishopMoves(state, [3, 3]);

    expect(moves.length).toBe(13);
  });
});
