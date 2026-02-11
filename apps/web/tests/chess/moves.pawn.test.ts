import { describe, expect, test } from "bun:test";
import { parseFEN } from "$lib/chess/internal/handleFEN";
import { pawnMoves } from "$lib/chess/internal/moves/moves.pawn";
import type { Piece } from "$lib/chess/internal/types";

describe("pawnMoves", () => {
  test("allows a pawn to move one square forward", () => {
    const state = parseFEN("8/8/8/8/8/8/P7/8 w - - 0 1");
    const moves = pawnMoves(state, [6, 0]);

    expect(moves).toContainEqual({ from: [6, 0], to: [5, 0] });
    expect(moves).toContainEqual({ from: [6, 0], to: [4, 0] });
    expect(moves.length).toBe(2);
  });

  test("generates capture moves diagonally", () => {
    const state = parseFEN("8/8/8/3p4/2P5/8/8/8 w - - 0 1");
    const moves = pawnMoves(state, [4, 2]);

    expect(moves).toContainEqual({ from: [4, 2], to: [3, 3] });
    expect(moves).toContainEqual({ from: [4, 2], to: [3, 2] });
    expect(moves.length).toBe(2);
  });

  test("generates promotion moves when reaching last rank", () => {
    const state = parseFEN("8/P7/8/8/8/8/8/8 w - - 0 1");
    const moves = pawnMoves(state, [1, 0]);
    const promotions: Piece[] = ["Q", "R", "B", "N"];

    for (const p of promotions)
      expect(moves).toContainEqual({
        from: [1, 0],
        to: [0, 0],
        promotion: p,
      });
    expect(moves.length).toBe(4);
  });

  test("generates en passant captures", () => {
    const state = parseFEN("8/8/8/3pP3/8/8/8/8 w - d6 0 1");
    const moves = pawnMoves(state, [3, 4]);

    expect(moves).toContainEqual({ from: [3, 4], to: [2, 3] });
    expect(moves).toContainEqual({ from: [3, 4], to: [2, 4] });
    expect(moves.length).toBe(2);
  });

  test("does not allow pawn to en passant into a non en passant situation", () => {
    const state = parseFEN("8/8/8/3pP3/8/8/8/8 w - - 0 1");
    const moves = pawnMoves(state, [3, 4]);

    expect(moves).toContainEqual({ from: [3, 4], to: [2, 4] });
    expect(moves.length).toBe(1);
  });

  test("generates promotion with captures", () => {
    const state = parseFEN("3p4/4P3/8/8/8/8/8/8 w - - 0 1");
    const moves = pawnMoves(state, [1, 4]);
    const promotions: Piece[] = ["Q", "R", "B", "N"];

    for (const p of promotions)
      expect(moves).toContainEqual({
        from: [1, 4],
        to: [0, 4],
        promotion: p,
      });
    for (const p of promotions)
      expect(moves).toContainEqual({
        from: [1, 4],
        to: [0, 3],
        promotion: p,
      });
    expect(moves.length).toBe(8);
  });

  test("does not allow pawn to move into occupied square", () => {
    const state = parseFEN("8/8/8/8/8/1Q6/1P6/8 w - - 0 1");
    const moves = pawnMoves(state, [6, 0]);

    expect(moves.length).toBe(0);
  });

  test("does not allow pawn to move into occupied square by enemy", () => {
    const state = parseFEN("8/8/8/8/8/4p3/4P3/8 b - - 0 1");
    const moves = pawnMoves(state, [6, 4]);

    expect(moves.length).toBe(0);
  });

  test("does not allow pawn to capture empty diagonal", () => {
    const state = parseFEN("8/8/8/8/8/8/P7/8 w - - 0 1");
    const moves = pawnMoves(state, [6, 0]);

    expect(moves).not.toContainEqual({ from: [6, 0], to: [5, 1] });
  });

  test("handles black pawns correctly", () => {
    const state = parseFEN("8/1p6/8/8/8/8/8/8 b - - 0 1");
    const moves = pawnMoves(state, [1, 1]);

    expect(moves).toContainEqual({ from: [1, 1], to: [2, 1] });
    expect(moves).toContainEqual({ from: [1, 1], to: [3, 1] });
    expect(moves.length).toBe(2);
  });
});
