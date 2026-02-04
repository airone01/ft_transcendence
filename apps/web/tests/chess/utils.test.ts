import { describe, expect, test } from "bun:test";
import { isInBoard } from "$lib/chess/internal/utils";

describe("isInBoard", () => {
  test("returns true for valid squares", () => {
    expect(isInBoard([0, 0])).toBe(true);
    expect(isInBoard([7, 7])).toBe(true);
    expect(isInBoard([3, 4])).toBe(true);
  });

  test("returns false for invalid squares", () => {
    expect(isInBoard([-1, 0])).toBe(false);
    expect(isInBoard([0, -1])).toBe(false);
    expect(isInBoard([-1, -1])).toBe(false);
    expect(isInBoard([8, 0])).toBe(false);
    expect(isInBoard([0, 8])).toBe(false);
    expect(isInBoard([8, 8])).toBe(false);
  });
});
