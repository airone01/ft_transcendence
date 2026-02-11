import { describe, expect, test } from "bun:test";
import { boardToFEN, parseFEN } from "$lib/chess/internal/handleFEN";

describe("parseFEN", () => {
  test("board: parses empty board", () => {
    const fen = "8/8/8/8/8/8/8/8 w - - 0 1";
    const state = parseFEN(fen);

    for (let r = 0; r < 8; r++) {
      for (let c = 0; c < 8; c++) {
        expect(state.board[r][c]).toBe(null);
      }
    }

    expect(state.board.length).toBe(8);
    for (const row of state.board) {
      expect(row.length).toBe(8);
    }
  });

  test("board: parses mixed digits and pieces in row", () => {
    const fen = "3k2q1/8/8/8/8/8/8/4K3 w - - 0 1";
    const state = parseFEN(fen);

    for (let r = 0; r < 8; r++)
      for (let c = 0; c < 8; c++) {
        if (r === 0 && c === 3) expect(state.board[r][c]).toBe("k");
        else if (r === 0 && c === 6) expect(state.board[r][c]).toBe("q");
        else if (r === 7 && c === 4) expect(state.board[r][c]).toBe("K");
        else expect(state.board[r][c]).toBe(null);
      }

    expect(state.board.length).toBe(8);
    for (const row of state.board) {
      expect(row.length).toBe(8);
    }
  });

  test("board: parses initial position", () => {
    const fen = "rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1";
    const state = parseFEN(fen);

    // first row
    expect(state.board[0][0]).toBe("r");
    expect(state.board[0][1]).toBe("n");
    expect(state.board[0][2]).toBe("b");
    expect(state.board[0][3]).toBe("q");
    expect(state.board[0][4]).toBe("k");
    expect(state.board[0][5]).toBe("b");
    expect(state.board[0][6]).toBe("n");
    expect(state.board[0][7]).toBe("r");

    // second row
    for (let c = 0; c < 8; c++) expect(state.board[1][c]).toBe("p");

    // middle of the board
    for (let r = 2; r < 6; r++)
      for (let c = 0; c < 8; c++) expect(state.board[r][c]).toBe(null);

    // penultimate row
    for (let c = 0; c < 8; c++) expect(state.board[6][c]).toBe("P");

    // last row
    expect(state.board[7][0]).toBe("R");
    expect(state.board[7][1]).toBe("N");
    expect(state.board[7][2]).toBe("B");
    expect(state.board[7][3]).toBe("Q");
    expect(state.board[7][4]).toBe("K");
    expect(state.board[7][5]).toBe("B");
    expect(state.board[7][6]).toBe("N");
    expect(state.board[7][7]).toBe("R");

    expect(state.board.length).toBe(8);
    for (const row of state.board) {
      expect(row.length).toBe(8);
    }
  });

  test("board: parses 1.e4", () => {
    const fen = "rnbqkbnr/pppppppp/8/8/4P3/8/PPPP1PPP/RNBQKBNR w KQkq - 0 1";
    const state = parseFEN(fen);

    // first row
    expect(state.board[0][0]).toBe("r");
    expect(state.board[0][1]).toBe("n");
    expect(state.board[0][2]).toBe("b");
    expect(state.board[0][3]).toBe("q");
    expect(state.board[0][4]).toBe("k");
    expect(state.board[0][5]).toBe("b");
    expect(state.board[0][6]).toBe("n");
    expect(state.board[0][7]).toBe("r");

    // second row
    for (let c = 0; c < 8; c++) expect(state.board[1][c]).toBe("p");

    // middle of the board
    for (let r = 2; r < 6; r++)
      for (let c = 0; c < 8; c++) {
        if (r === 4 && c === 4) expect(state.board[r][c]).toBe("P");
        else expect(state.board[r][c]).toBe(null);
      }

    // penultimate row
    for (let c = 0; c < 8; c++) {
      if (c === 4) expect(state.board[6][c]).toBe(null);
      else expect(state.board[6][c]).toBe("P");
    }

    // last row
    expect(state.board[7][0]).toBe("R");
    expect(state.board[7][1]).toBe("N");
    expect(state.board[7][2]).toBe("B");
    expect(state.board[7][3]).toBe("Q");
    expect(state.board[7][4]).toBe("K");
    expect(state.board[7][5]).toBe("B");
    expect(state.board[7][6]).toBe("N");
    expect(state.board[7][7]).toBe("R");

    expect(state.board.length).toBe(8);
    for (const row of state.board) {
      expect(row.length).toBe(8);
    }
  });

  test("board: parses 1.e4 2.d5 3.Nf3", () => {
    const fen =
      "rnbqkbnr/ppp1pppp/8/3p4/4P3/5N2/PPPP1PPP/RNBQKB1R w KQkq - 0 1";
    const state = parseFEN(fen);

    // first row
    expect(state.board[0][0]).toBe("r");
    expect(state.board[0][1]).toBe("n");
    expect(state.board[0][2]).toBe("b");
    expect(state.board[0][3]).toBe("q");
    expect(state.board[0][4]).toBe("k");
    expect(state.board[0][5]).toBe("b");
    expect(state.board[0][6]).toBe("n");
    expect(state.board[0][7]).toBe("r");

    // second row
    for (let c = 0; c < 8; c++) {
      if (c === 3) expect(state.board[1][c]).toBe(null);
      else expect(state.board[1][c]).toBe("p");
    }

    // middle of the board
    for (let r = 2; r < 6; r++)
      for (let c = 0; c < 8; c++) {
        if (r === 4 && c === 4) expect(state.board[r][c]).toBe("P");
        else if (r === 3 && c === 3) expect(state.board[r][c]).toBe("p");
        else if (r === 5 && c === 5) expect(state.board[r][c]).toBe("N");
        else expect(state.board[r][c]).toBe(null);
      }

    // penultimate row
    for (let c = 0; c < 8; c++) {
      if (c === 4) expect(state.board[6][c]).toBe(null);
      else expect(state.board[6][c]).toBe("P");
    }

    // last row
    expect(state.board[7][0]).toBe("R");
    expect(state.board[7][1]).toBe("N");
    expect(state.board[7][2]).toBe("B");
    expect(state.board[7][3]).toBe("Q");
    expect(state.board[7][4]).toBe("K");
    expect(state.board[7][5]).toBe("B");
    expect(state.board[7][6]).toBe(null);
    expect(state.board[7][7]).toBe("R");

    expect(state.board.length).toBe(8);
    for (const row of state.board) {
      expect(row.length).toBe(8);
    }
  });

  test("turn: parses w", () => {
    const fen = "8/8/8/8/8/8/8/8 w - - 0 1";
    const state = parseFEN(fen);

    expect(state.turn).toBe("w");
  });

  test("turn: parses b", () => {
    const fen = "8/8/8/8/8/8/8/8 b - - 0 1";
    const state = parseFEN(fen);

    expect(state.turn).toBe("b");
  });

  test("castling rights: parses -", () => {
    const fen = "8/8/8/8/8/8/8/8 w - - 0 1";
    const state = parseFEN(fen);

    expect(state.castling.whiteKingSide).toBe(false);
    expect(state.castling.whiteQueenSide).toBe(false);
    expect(state.castling.blackKingSide).toBe(false);
    expect(state.castling.blackQueenSide).toBe(false);
  });

  test("castling rights: parses Kq", () => {
    const fen = "8/8/8/8/8/8/8/8 w Kq - 0 1";
    const state = parseFEN(fen);

    expect(state.castling.whiteKingSide).toBe(true);
    expect(state.castling.whiteQueenSide).toBe(false);
    expect(state.castling.blackKingSide).toBe(false);
    expect(state.castling.blackQueenSide).toBe(true);
  });

  test("en passant: parses -", () => {
    const fen = "8/8/8/8/8/8/8/8 w - - 0 1";
    const state = parseFEN(fen);

    expect(state.enPassant).toEqual(null);
  });

  test("en passant: parses f6 square", () => {
    const fen = "8/8/8/4Pp2/8/8/8/8 w - f6 0 1";
    const state = parseFEN(fen);

    expect(state.enPassant).toEqual([2, 5]);
  });

  test("counters: parses move counters 12 34", () => {
    const fen = "8/8/8/8/8/8/8/8 w - - 12 34";
    const state = parseFEN(fen);

    expect(state.halfMoveCount).toBe(12);
    expect(state.fullMoveCount).toBe(34);
  });
});

describe("boardToFEN", () => {
  const cases = [
    // Empty boards
    "8/8/8/8/8/8/8/8 w - - 0 1",
    "8/8/8/8/8/8/8/8 b - - 15 42",

    // Initial position
    "rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1",

    // Simple openings
    "rnbqkbnr/pppppppp/8/8/4P3/8/PPPP1PPP/RNBQKBNR b KQkq - 0 1",
    "rnbqkbnr/ppp1pppp/8/3p4/4P3/8/PPPP1PPP/RNBQKBNR w KQkq - 0 2",
    "rnbqkbnr/ppp1pppp/8/3p4/4P3/5N2/PPPP1PPP/RNBQKB1R b KQkq - 1 2",

    // Castling positions
    "r3k2r/pppppppp/8/8/8/8/PPPPPPPP/R3K2R w KQkq - 0 1",
    "r3k2r/pppppppp/8/8/8/8/PPPPPPPP/R3K2R w KQ - 0 1",
    "r3k2r/pppppppp/8/8/8/8/PPPPPPPP/R3K2R w - - 0 1",

    // En passant squares
    "8/8/8/4Pp2/8/8/8/8 w - f6 0 1",
    "8/8/8/3pP3/8/8/8/8 b - e3 0 1",

    // Mixed digits
    "3k4/8/8/8/8/8/8/4K3 w - - 0 1",
    "2k5/3p4/8/8/8/8/4P3/5K2 w - - 0 1",

    // Middle game positions
    "r1bqkbnr/pppp1ppp/2n5/4p3/4P3/2N2N2/PPPP1PPP/R1BQKB1R w KQkq - 2 3",
    "r2qk2r/ppp1bppp/2npbn2/4p3/4P3/2NP1N2/PPP1BPPP/R1BQ1RK1 w kq - 4 6",

    // Endgames
    "8/8/8/8/8/3k4/8/3K4 w - - 0 1",
    "8/8/8/8/2K5/8/5k2/8 b - - 0 1",

    // Promotions
    "8/P7/8/8/8/8/7p/7K w - - 0 1",
    "7k/6P1/8/8/8/8/8/7K b - - 0 1",

    // No castling rights, midgame
    "rnbq1bnr/pppp1ppp/4k3/4p3/4P3/5N2/PPPP1PPP/RNBQKB1R w - - 4 5",

    // Weird but legal distributions
    "qqqqqqqq/8/8/8/8/8/8/QQQQQQQQ w - - 0 1",
    "nnnnnnnn/pppppppp/8/8/8/8/PPPPPPPP/NNNNNNNN w - - 0 1",

    // High clocks
    "8/8/8/8/8/8/8/8 w - - 99 200",
  ];

  test("stringifies all FEN identity cases", () => {
    for (const fen of cases) {
      const state = parseFEN(fen);
      const result = boardToFEN(state);
      expect(result).toBe(fen);
    }
  });
});
