import { describe, expect, test } from "bun:test";
import { parseFEN } from "$lib/chess/internal/board";
import {
  isCheckmate,
  isFiftyMoveRule,
  isInsufficientMaterial,
  isStalemate,
} from "$lib/chess/internal/gameStatus";

describe("isCheckmate", () => {
  test("detects queen + king mate", () => {
    const state = parseFEN("7k/6Q1/7K/8/8/8/8/8 b - - 0 1");
    expect(isCheckmate(state)).toBe(true);
  });

  test("detects rook mate", () => {
    const state = parseFEN("7k/5K2/8/7R/8/8/8/8 b - - 0 1");
    expect(isCheckmate(state)).toBe(true);
  });

  test("detects back rank mate", () => {
    const state = parseFEN("4k3/5ppp/8/8/8/8/5PPP/4r1K1 w - - 0 1");
    expect(isCheckmate(state)).toBe(true);
  });

  test("is false if king in check but escape exists", () => {
    const state = parseFEN("7k/8/5Q1K/8/8/8/8/8 b - - 0 1");
    expect(isCheckmate(state)).toBe(false);
  });

  test("is false if no check", () => {
    const state = parseFEN("8/8/8/8/8/8/4K3/7k w - - 0 1");
    expect(isCheckmate(state)).toBe(false);
  });
});

describe("isStalemate", () => {
  test("detects classic stalemate", () => {
    const state = parseFEN("7k/5Q2/6K1/8/8/8/8/8 b - - 0 1");
    expect(isStalemate(state)).toBe(true);
  });

  test("detects stalemate in corner", () => {
    const state = parseFEN("k7/2Q5/2K5/8/8/8/8/8 b - - 0 1");
    expect(isStalemate(state)).toBe(true);
  });

  test("false if king in check", () => {
    const state = parseFEN("7k/8/5Q1K/8/8/8/8/8 b - - 0 1");
    expect(isStalemate(state)).toBe(false);
  });

  test("false if legal move exists", () => {
    const state = parseFEN("6qk/8/5Q1K/8/8/8/8/8 b - - 0 1");
    expect(isStalemate(state)).toBe(false);
  });

  test("white stalemated", () => {
    const state = parseFEN("8/1r5/8/8/8/8/6q1/K7 w - - 0 1");
    expect(isStalemate(state)).toBe(true);
  });
});

describe("isInsufficientMaterial", () => {
  test("K vs K", () => {
    const state = parseFEN("8/8/8/8/8/8/8/Kk6 w - - 0 1");
    expect(isInsufficientMaterial(state)).toBe(true);
  });

  test("K+B vs K", () => {
    const state = parseFEN("8/8/8/8/8/8/7B/Kk6 w - - 0 1");
    expect(isInsufficientMaterial(state)).toBe(true);
  });

  test("K+N vs K", () => {
    const state = parseFEN("8/8/8/8/8/8/7N/Kk6 w - - 0 1");
    expect(isInsufficientMaterial(state)).toBe(true);
  });

  test("K+B vs K+B same color", () => {
    const state = parseFEN("8/8/8/B1b5/8/8/8/Kk6 w - - 0 1");
    expect(isInsufficientMaterial(state)).toBe(true);
  });

  test("K+B vs K+B different color", () => {
    const state = parseFEN("8/8/8/Bb6/8/8/8/Kk6 w - - 0 1");
    expect(isInsufficientMaterial(state)).toBe(false);
  });

  test("K+R vs K", () => {
    const state = parseFEN("8/8/8/8/8/8/7R/Kk6 w - - 0 1");
    expect(isInsufficientMaterial(state)).toBe(false);
  });
});

describe("isFiftyMoveRule", () => {
  test("false when under 100", () => {
    const state = parseFEN("8/8/8/8/8/8/8/Kk6 w - - 99 10");
    expect(isFiftyMoveRule(state)).toBe(false);
  });

  test("true when equal 100", () => {
    const state = parseFEN("8/8/8/8/8/8/8/Kk6 w - - 100 10");
    expect(isFiftyMoveRule(state)).toBe(true);
  });

  test("true when above 100", () => {
    const state = parseFEN("8/8/8/8/8/8/8/Kk6 w - - 150 10");
    expect(isFiftyMoveRule(state)).toBe(true);
  });
});
