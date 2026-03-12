import { type Writable, writable } from "svelte/store";
import { socketManager } from "$lib/stores/socket.svelte";
import { toast } from "svelte-sonner";
import { m } from "$lib/paraglide/messages";

type SocketMessageKey = keyof typeof m;

// ─── Types ──────────────────────────────────────────────────────────────────

export interface ChatMessage {
  userId: string;
  username: string;
  content: string;
  timestamp: string;
}

export interface DirectMessage extends ChatMessage {
  senderId: string;
  receiverId: string;
}

// ─── Stores ─────────────────────────────────────────────────────────────────

export const globalMessages: Writable<ChatMessage[]> = writable([]);
export const friendMessages = writable<Record<string, ChatMessage[]>>({});

// ─── Actions ────────────────────────────────────────────────────────────────

export function sendGlobalMessage(content: string) {
  if (!content.trim()) return;
  socketManager.emit("chat:global", { content: content.trim() });
}

export function sendFriendMessage(friendId: string, content: string) {
  if (!content.trim()) return;
  socketManager.emit("chat:friend", { friendId, content });
}

export function clearGlobalMessages() {
  globalMessages.set([]);
}

export function clearFriendMessages() {
  friendMessages.set({});
}

// ─── Event Listeners ────────────────────────────────────────────────────────

export function setupChatListeners(currentUserId: string) {
  socketManager.on("chat:global", ((data: ChatMessage) => {
    globalMessages.update((messages) => [...messages, data]);
  }) as unknown as (...args: unknown[]) => void);

  socketManager.on("chat:friend", ((msg: DirectMessage) => {
    friendMessages.update((allMsgs) => {
      const chatId =
        String(msg.senderId) === String(currentUserId)
          ? String(msg.receiverId)
          : String(msg.senderId);

      const newMsgs = { ...allMsgs };

      if (!newMsgs[chatId]) newMsgs[chatId] = [];
      else newMsgs[chatId] = [...newMsgs[chatId]];

      newMsgs[chatId].push(msg);
      return newMsgs;
    });
  }) as unknown as (...args: unknown[]) => void);

  socketManager.on("chat:error", ((data: { message: SocketMessageKey }) => {
    const translate = m[data.message] as () => string;
    const text = typeof translate === "function" ? translate() : m.toast_error();

    console.error("Chat error:", text);
    toast.error(`Chat error: ${text}`);
  }) as unknown as (...args: unknown[]) => void);
}
