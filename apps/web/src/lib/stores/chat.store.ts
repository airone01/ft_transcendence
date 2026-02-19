import { type Writable, writable } from "svelte/store";
import { socketManager } from "$lib/stores/socket.svelte";

// ─── Types ──────────────────────────────────────────────────────────────────

export interface ChatMessage {
  userId: string;
  username: string;
  content: string;
  timestamp: string;
}

// ─── Stores ─────────────────────────────────────────────────────────────────

export const globalMessages: Writable<ChatMessage[]> = writable([]);
export const gameMessages: Writable<ChatMessage[]> = writable([]);

// ─── Actions ────────────────────────────────────────────────────────────────

export function sendGlobalMessage(content: string) {
  if (!content.trim()) return;
  socketManager.emit("chat:global", { content: content.trim() });
}

export function sendGameMessage(gameId: string, content: string) {
  if (!content.trim()) return;
  socketManager.emit("chat:game", { gameId, content: content.trim() });
}

export function clearGlobalMessages() {
  globalMessages.set([]);
}

export function clearGameMessages() {
  gameMessages.set([]);
}

// ─── Event Listeners ────────────────────────────────────────────────────────

export function setupChatListeners() {
  socketManager.on("chat:global", ((data: ChatMessage) => {
    globalMessages.update((messages) => [...messages, data]);
  }) as unknown as (...args: unknown[]) => void);

  socketManager.on("chat:game", ((data: ChatMessage) => {
    gameMessages.update((messages) => [...messages, data]);
  }) as unknown as (...args: unknown[]) => void);

  socketManager.on("chat:error", ((data: { message: string }) => {
    console.error("Chat error:", data.message);
    alert(`Chat·error:·${data.message}`);
  }) as unknown as (...args: unknown[]) => void);
}
