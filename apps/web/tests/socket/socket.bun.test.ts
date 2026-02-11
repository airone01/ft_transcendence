//tests/socket/socket.test.ts
process.env.DATABASE_URL = "postgresql://test:test@localhost:5432/test";

import { describe, it, expect, mock } from "bun:test";

// ─── Mocks (après avoir set DATABASE_URL) ───────────────────────────────────

mock.module("@transc/db", () => ({
  db: {
    update: () => ({
      set: () => ({
        where: () => Promise.resolve(),
      }),
    }),
    insert: () => ({
      values: () => Promise.resolve({ returning: () => [{ id: 1 }] }),
    }),
    select: () => ({
      from: () => ({
        where: () => ({
          limit: () => Promise.resolve([]),
        }),
      }),
    }),
  },
}));

mock.module("@transc/db/schema", () => ({
  game: {},
  user: {},
  chatMessage: {},
}));

mock.module("drizzle-orm", () => ({
  eq: mock((a: any, b: any) => ({ a, b })),
}));

mock.module("$lib/db-services", () => ({
  dbCreateGame: mock(async () => 1),
  dbGetGame: mock(async (id: number) => ({
    id,
    status: "ongoing",
    timeControlSeconds: 600,
    incrementSeconds: 5,
    fen: "rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1",
    result: null,
    createdAt: new Date(),
    startedAt: new Date(),
    endedAt: null,
  })),
  dbGetPlayers: mock(async () => ({ whitePlayerId: 1, blackPlayerId: 2 })),
  dbUpdateGame: mock(async () => {}),
  dbEndGame: mock(async () => {}),
  DBGameNotFoundError: class extends Error {},
  DBPlayersNotFoundError: class extends Error {},
}));

// ─── Imports après les mocks ─────────────────────────────────────────────────

import { GameRoom } from "../../src/lib/server/socket/rooms/GameRoom";

const STARTING_FEN = "rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1";
const SCHOLARS_MATE_FEN = "r1bqkb1r/pppp1ppp/2n2n2/4p2Q/2B1P3/8/PPPP1PPP/RNB1K1NR w KQkq - 4 4";
const STALEMATE_FEN = "k7/8/1K6/8/8/8/8/8 b - - 0 1";

// ─── Tests ───────────────────────────────────────────────────────────────────

describe("GameRoom - Création et état", () => {
  it("should initialize with starting FEN", () => {
    const room = new GameRoom("1", { whiteId: "u1", blackId: "u2" });
    expect(room.getState().fen).toBe(STARTING_FEN);
    expect(room.getState().turn).toBe("w");
  });

  it("should identify player turn", () => {
    const room = new GameRoom("1", { whiteId: "u1", blackId: "u2" });
    expect(room.isPlayerTurn("u1")).toBe(true);
    expect(room.isPlayerTurn("u2")).toBe(false);
  });

  it("should return opponent", () => {
    const room = new GameRoom("1", { whiteId: "u1", blackId: "u2" });
    expect(room.getOpponent("u1")).toBe("u2");
  });
});

describe("GameRoom - Coups valides", () => {
  it("should accept e2-e4", async () => {
    const room = new GameRoom("1", { whiteId: "u1", blackId: "u2" });
    const result = await room.makeMove("u1", { from: "e2", to: "e4" });
    expect(result.valid).toBe(true);
  });

  it("should switch turn after move", async () => {
    const room = new GameRoom("1", { whiteId: "u1", blackId: "u2" });
    await room.makeMove("u1", { from: "e2", to: "e4" });
    expect(room.getState().turn).toBe("b");
  });

  it("should update FEN", async () => {
    const room = new GameRoom("1", { whiteId: "u1", blackId: "u2" });
    const before = room.getState().fen;
    await room.makeMove("u1", { from: "e2", to: "e4" });
    expect(room.getState().fen).not.toBe(before);
  });
});

describe("GameRoom - Coups invalides", () => {
  it("should reject if not turn", async () => {
    const room = new GameRoom("1", { whiteId: "u1", blackId: "u2" });
    const result = await room.makeMove("u2", { from: "e7", to: "e5" });
    expect(result.valid).toBe(false);
    expect(result.error).toBe("Not your turn");
  });

  it("should reject illegal move", async () => {
    const room = new GameRoom("1", { whiteId: "u1", blackId: "u2" });
    const result = await room.makeMove("u1", { from: "e2", to: "e5" });
    expect(result.valid).toBe(false);
  });
});

describe("GameRoom - Fin de partie", () => {
  it("should detect checkmate", async () => {
    const room = new GameRoom("1", {
      whiteId: "u1",
      blackId: "u2",
      fen: SCHOLARS_MATE_FEN,
    });
    const result = await room.makeMove("u1", { from: "h5", to: "f7" });
    expect(result.checkmate).toBe(true);
    expect(result.gameOver).toBe(true);
  });

  it("should detect stalemate", () => {
    const room = new GameRoom("1", {
      whiteId: "u1",
      blackId: "u2",
      fen: STALEMATE_FEN,
    });
    expect(room.getState().isDraw).toBe(true);
  });

  it("should handle resignation", async () => {
    const room = new GameRoom("1", { whiteId: "u1", blackId: "u2" });
    await expect(room.endGame("resignation", "u2")).resolves.toBeUndefined();
  });
});

describe("GameRoom - Séquences", () => {
  it("should play opening moves", async () => {
    const room = new GameRoom("1", { whiteId: "u1", blackId: "u2" });
    await room.makeMove("u1", { from: "e2", to: "e4" });
    await room.makeMove("u2", { from: "e7", to: "e5" });
    await room.makeMove("u1", { from: "g1", to: "f3" });
    const r = await room.makeMove("u2", { from: "b8", to: "c6" });
    expect(r.valid).toBe(true);
  });
});

describe("GameRoom - Isolation", () => {
  it("should keep rooms independent", async () => {
    const r1 = new GameRoom("1", { whiteId: "u1", blackId: "u2" });
    const r2 = new GameRoom("2", { whiteId: "u3", blackId: "u4" });
    await r1.makeMove("u1", { from: "e2", to: "e4" });
    expect(r2.getState().fen).toBe(STARTING_FEN);
  });
});

console.log("14 tests GameRoom");