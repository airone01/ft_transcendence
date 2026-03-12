import { type Writable, writable } from "svelte/store";
import { toast } from "svelte-sonner";
import { goto } from "$app/navigation";
import { m } from "$lib/paraglide/messages";
import { gameState } from "$lib/stores/game.store";
import { socketManager } from "$lib/stores/socket.svelte";

type SocketMessageKey = keyof typeof m;

// ─── Types ──────────────────────────────────────────────────────────────────

export interface MatchmakingState {
  inQueue: boolean;
  mode: string | null;
  position: number | null;
}

// ─── Stores ─────────────────────────────────────────────────────────────────

export const matchmakingState: Writable<MatchmakingState> = writable({
  inQueue: false,
  mode: null,
  position: null,
});

// ─── Actions ────────────────────────────────────────────────────────────────

export function joinQueue(mode: "blitz" | "rapid" | "casual") {
  socketManager.emit("matchmaking:join", { mode });
  matchmakingState.set({ inQueue: true, mode, position: null });
}

export function leaveQueue(mode: string) {
  socketManager.emit("matchmaking:leave", { mode });
  matchmakingState.set({ inQueue: false, mode: null, position: null });
}

// ─── Event Listeners ────────────────────────────────────────────────────────

export function setupMatchmakingListeners() {
  socketManager.on("matchmaking:waiting", ((data: {
    mode: string;
    position: number;
  }) => {
    matchmakingState.update((state) => ({
      ...state,
      position: data.position,
    }));
  }) as unknown as (...args: unknown[]) => void);

  socketManager.on("matchmaking:matched", ((data: {
    gameId: string;
    color: "white" | "black";
  }) => {
    console.log("Match found!", data);
    matchmakingState.set({ inQueue: false, mode: null, position: null });

    // Pre-set color in game store before navigating, reset previous game state
    gameState.update((state) => ({
      ...state,
      gameId: data.gameId,
      myColor: data.color,
      gameOver: false,
      winner: null,
      reason: null,
      check: false,
      drawOffered: false,
      moves: [],
    }));

    goto(`/game/${data.gameId}`);
  }) as unknown as (...args: unknown[]) => void);

  socketManager.on("matchmaking:left", ((_data: { mode: string }) => {
    matchmakingState.set({ inQueue: false, mode: null, position: null });
  }) as unknown as (...args: unknown[]) => void);

  socketManager.on("matchmaking:error", ((data: {
    message: SocketMessageKey;
  }) => {
    matchmakingState.set({ inQueue: false, mode: null, position: null });

    const translate = m[data.message] as () => string;
    const text =
      typeof translate === "function" ? translate() : m.toast_error();
    console.error("Matchmaking error:", text);
    toast(`Error:·${text}`);
  }) as unknown as (...args: unknown[]) => void);
}
