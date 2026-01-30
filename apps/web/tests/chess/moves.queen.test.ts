import { describe, test, expect } from "bun:test";
import { parseFEN } from "$lib/chess/internal/board";
import { queenMoves } from "$lib/chess/internal/moves.queen";

describe("queenMoves", () => {
  test("generates rook-like and bishop-like moves from center", () => {
    const state = parseFEN("8/8/8/3Q4/8/8/8/8 w - - 0 1");
    const moves = queenMoves(state, [3, 3]);

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
    expect(moves.length).toBe(27);
  });

  test("generates limited moves from corner", () => {
    const state = parseFEN("Q7/8/8/8/8/8/8/8 w - - 0 1");
    const moves = queenMoves(state, [0, 0]);

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
      { from: [0, 0], to: [1, 1] },
      { from: [0, 0], to: [2, 2] },
      { from: [0, 0], to: [3, 3] },
      { from: [0, 0], to: [4, 4] },
      { from: [0, 0], to: [5, 5] },
      { from: [0, 0], to: [6, 6] },
      { from: [0, 0], to: [7, 7] },
    ];

    expect(moves).toEqual(expect.arrayContaining(expected));
    expect(moves.length).toBe(21);
  });

  test("blocked by allied piece", () => {
    const state = parseFEN("8/8/2P5/3Q4/8/8/8/8 w - - 0 1");
    const moves = queenMoves(state, [3, 3]);

    expect(moves).not.toContainEqual({ from: [3, 3], to: [2, 2] });
    expect(moves).not.toContainEqual({ from: [3, 3], to: [1, 1] });
    expect(moves).not.toContainEqual({ from: [3, 3], to: [0, 0] });
    expect(moves.length).toBe(24);
  });

  test("can capture enemy piece but not beyond", () => {
    const state = parseFEN("8/8/2p5/3Q4/8/8/8/8 w - - 0 1");
    const moves = queenMoves(state, [3, 3]);

    expect(moves).toContainEqual({ from: [3, 3], to: [2, 2] });
    expect(moves).not.toContainEqual({ from: [3, 3], to: [1, 1] });
    expect(moves.length).toBe(25);
  });

  test("can mix rook and bishop captures", () => {
    const state = parseFEN("8/8/3pp3/3Q4/8/8/8/8 w - - 0 1");
    const moves = queenMoves(state, [3, 3]);

    expect(moves).toContainEqual({ from: [3, 3], to: [2, 3] });
    expect(moves).toContainEqual({ from: [3, 3], to: [2, 4] });
    expect(moves.length).toBe(23);
  });

  test("handles black queen", () => {
    const state = parseFEN("8/8/8/3q4/8/8/8/8 b - - 0 1");
    const moves = queenMoves(state, [3, 3]);

    expect(moves.length).toBe(27);
  });
});
