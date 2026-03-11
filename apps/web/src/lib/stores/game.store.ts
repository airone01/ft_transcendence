import { derived, get, type Writable, writable } from "svelte/store";
import { toast } from "svelte-sonner";
import { socketManager } from "$lib/stores/socket.svelte";

// ─── Types ──────────────────────────────────────────────────────────────────

export interface MoveRecord {
  from: string;
  to: string;
  promotion?: string;
  color: "w" | "b";
  check: boolean;
  checkmate: boolean;
}

export interface GameState {
  gameId: string | null;
  fen: string;
  turn: "w" | "b";
  myColor: "white" | "black" | null;
  isCheckmate: boolean;
  isDraw: boolean;
  isBotGame: boolean;
  check: boolean;
  gameOver: boolean;
  winner: string | null;
  winnerName: string | null;
  reason: string | null;
  whiteTimeLeft: number;
  blackTimeLeft: number;
  moves: MoveRecord[];
  drawOffered: boolean;
  drawOfferSent: boolean;
  isSpectator: boolean;
  eloChange: { white: number; black: number } | null;
}

export interface GameMove {
  from: string;
  to: string;
  promotion?: string;
  fen?: string;
  check?: boolean;
  checkmate?: boolean;
  stalemate?: boolean;
}

// ─── Stores ─────────────────────────────────────────────────────────────────

const DEFAULT_TIME = 600_000;

export const gameState: Writable<GameState> = writable({
  gameId: null,
  fen: "rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1",
  turn: "w",
  myColor: null,
  isCheckmate: false,
  isDraw: false,
  isBotGame: false,
  check: false,
  gameOver: false,
  winner: null,
  winnerName: null,
  reason: null,
  whiteTimeLeft: DEFAULT_TIME,
  blackTimeLeft: DEFAULT_TIME,
  moves: [],
  drawOffered: false,
  drawOfferSent: false,
  isSpectator: false,
  eloChange: null,
});

export function quitBotGame() {
  const state = get(gameState);
  if (state.isBotGame && state.gameId) {
    socketManager.emit("bot:quit", { gameId: state.gameId });

    gameState.set({
      gameId: null,
      fen: "rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1",
      turn: "w",
      myColor: null,
      gameOver: false,
      winner: null,
      winnerName: null,
      reason: null,
      check: false,
      isCheckmate: false,
      isDraw: false,
      drawOffered: false,
      whiteTimeLeft: 0,
      blackTimeLeft: 0,
      moves: [],
      isSpectator: false,
      isBotGame: false,
      eloChange: null,
      drawOfferSent: false,
    });
  }
}

if (typeof window !== "undefined") {
  const saved = localStorage.getItem("gameState");
  if (saved) {
    try {
      const parsed = JSON.parse(saved);
      if (
        parsed.gameId &&
        !parsed.gameOver &&
        !parsed.isSpectator &&
        !parsed.isBotGame
      ) {
        gameState.set(parsed);
        console.log(
          "[GameStore] Restored game state from localStorage:",
          parsed.gameId,
        );
      }
    } catch (_e) {
      console.error("[GameStore] Failed to parse saved game state");
    }
  }
}

gameState.subscribe((state) => {
  if (typeof window !== "undefined") {
    if (state.isBotGame) {
      localStorage.removeItem("gameState");
    } else {
      localStorage.setItem("gameState", JSON.stringify(state));
    }
  }
});

export const isMyTurn = derived(gameState, ($state) => {
  if (!$state.myColor) return false;
  return (
    ($state.turn === "w" && $state.myColor === "white") ||
    ($state.turn === "b" && $state.myColor === "black")
  );
});

// ─── Actions ────────────────────────────────────────────────────────────────

export function joinGame(gameId: string) {
  socketManager.emit("game:join", { gameId });
  socketManager.emit("presence:status", { status: "ingame" });
}

export function makeMove(from: string, to: string, promotion?: string) {
  const state = getCurrentGameState();
  if (!state) {
    console.error("error: Undifened");
    return;
  }
  if (!state.gameId) {
    console.error("No active game");
    return;
  }

  socketManager.emit("game:move", {
    gameId: state.gameId,
    from,
    to,
    promotion,
  });
}

export function offerDraw() {
  const state = getCurrentGameState();
  if (!state) {
    console.error("error: Undifened");
    return;
  }
  if (!state.gameId) return;
  if (state.drawOfferSent) return;
  gameState.update((s) => ({ ...s, drawOfferSent: true }));
  socketManager.emit("game:offer_draw", { gameId: state.gameId });
}

export function acceptDraw() {
  const state = getCurrentGameState();
  if (!state) {
    console.error("error: Undifened");
    return;
  }
  if (!state.gameId) return;
  socketManager.emit("game:accept_draw", { gameId: state.gameId });
}

export function resign() {
  const state = getCurrentGameState();
  if (!state) {
    console.error("error: Undifened");
    return;
  }
  if (!state.gameId) return;
  socketManager.emit("game:resign", { gameId: state.gameId });
}

export function leaveGame() {
  const state = getCurrentGameState();
  if (!state) {
    console.error("error: Undefined");
    return;
  }
  if (!state.gameId) return;
  socketManager.emit("game:leave", { gameId: state.gameId });
  socketManager.emit("presence:status", { status: "online" });

  gameState.set({
    gameId: null,
    fen: "rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1",
    turn: "w",
    myColor: null,
    isCheckmate: false,
    isDraw: false,
    isBotGame: false,
    check: false,
    gameOver: false,
    winner: null,
    winnerName: null,
    reason: null,
    whiteTimeLeft: DEFAULT_TIME,
    blackTimeLeft: DEFAULT_TIME,
    moves: [],
    drawOffered: false,
    drawOfferSent: false,
    isSpectator: false,
    eloChange: null,
  });
}

// ─── Event Listeners ────────────────────────────────────────────────────────

export function setupGameListeners() {
  socketManager.on("game:state", ((
    data: GameState & {
      myColor?: "white" | "black";
      whiteTimeLeft?: number;
      blackTimeLeft?: number;
      isSpectator?: boolean;
    },
  ) => {
    gameState.update((state) => ({
      ...state,
      gameId: data.gameId,
      fen: data.fen,
      turn: data.turn,
      myColor: data.myColor || state.myColor,
      isSpectator: data.isSpectator ?? false,
      isCheckmate: data.isCheckmate,
      isDraw: data.isDraw,
      whiteTimeLeft: data.whiteTimeLeft ?? state.whiteTimeLeft,
      blackTimeLeft: data.blackTimeLeft ?? state.blackTimeLeft,
      gameOver: false,
      winner: null,
      reason: null,
      check: false,
      moves: [],
    }));
  }) as unknown as (...args: unknown[]) => void);

  socketManager.on("game:move", ((
    data: GameMove & { whiteTimeLeft?: number; blackTimeLeft?: number },
  ) => {
    gameState.update((state) => ({
      ...state,
      fen: data.fen || state.fen,
      turn: state.turn === "w" ? "b" : "w",
      check: data.check || false,
      isCheckmate: data.checkmate || false,
      isDraw: data.stalemate || false,
      drawOffered: false,
      drawOfferSent: false,
      whiteTimeLeft: data.whiteTimeLeft ?? state.whiteTimeLeft,
      blackTimeLeft: data.blackTimeLeft ?? state.blackTimeLeft,
      moves: [
        ...state.moves,
        {
          from: data.from,
          to: data.to,
          promotion: data.promotion,
          color: state.turn,
          check: data.check || false,
          checkmate: data.checkmate || false,
        },
      ],
    }));
  }) as unknown as (...args: unknown[]) => void);

  socketManager.on("game:time", ((data: {
    whiteTimeLeft: number;
    blackTimeLeft: number;
  }) => {
    gameState.update((state) => ({
      ...state,
      whiteTimeLeft: data.whiteTimeLeft,
      blackTimeLeft: data.blackTimeLeft,
    }));
  }) as unknown as (...args: unknown[]) => void);

  socketManager.on("game:over", ((data: {
    winner: string | null;
    winnerName: string | null;
    reason: string;
  }) => {
    gameState.update((state) => ({
      ...state,
      gameOver: true,
      winner: data.winner,
      winnerName: data.winnerName,
      reason: data.reason,
      drawOffered: false,
      drawOfferSent: false,
    }));
  }) as unknown as (...args: unknown[]) => void);

  socketManager.on("game:draw_offered", ((_data: { from: string }) => {
    gameState.update((state) => ({ ...state, drawOffered: true }));
  }) as unknown as (...args: unknown[]) => void);

  socketManager.on("game:error", ((data: { message: string }) => {
    console.error("Game error:", data.message);
    toast(`Error:·${data.message}`);
  }) as unknown as (...args: unknown[]) => void);

  socketManager.on("player:joined", ((data: {
    userId: string;
    username: string;
  }) => {
    console.log("Player joined:", data.username);
  }) as unknown as (...args: unknown[]) => void);
}

// ─── Helpers ────────────────────────────────────────────────────────────────

function getCurrentGameState(): GameState | undefined {
  let state: GameState | undefined;
  gameState.subscribe((s) => {
    state = s;
    return s;
  })();
  return state;
}
