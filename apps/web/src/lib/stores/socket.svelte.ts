import { io, type Socket } from "socket.io-client";
import { type Writable, writable } from "svelte/store";
import { env } from "$env/dynamic/public";

// ─── Reactive stores (accessible from any component) ───────────

export const socketConnected: Writable<boolean> = writable(false);
export const socketReconnecting: Writable<boolean> = writable(false);
export const socketError: Writable<string | null> = writable(null);

// ─── SocketManager ───────────────────────────────────────────────────────────

class SocketManager {
  private socket: Socket | null = null;

  connect(userId: string, username: string) {
    if (this.socket?.connected) {
      socketConnected.set(true);
      return;
    }

    this.socket?.disconnect();

    this.socket = io(env.PUBLIC_WS_URL, {
      auth: { userId, username },
      transports: ["websocket"],
      reconnection: true,
      reconnectionDelay: 1000,
      reconnectionDelayMax: 5000,
      reconnectionAttempts: Infinity,
      timeout: 20000,
    });

    this.setupListeners();
  }

  private setupListeners() {
    if (!this.socket) return;

    this.socket.on("connect", () => {
      console.log("[ws] socket connected");
      socketConnected.set(true);
      socketReconnecting.set(false);
      socketError.set(null);
    });

    this.socket.on("disconnect", (reason) => {
      console.log("[ws] socket disconnected:", reason);
      socketConnected.set(false);

      if (reason === "io server disconnect") {
        this.socket?.connect();
      }
    });

    this.socket.on("connect_error", (error) => {
      console.error("[ws] connection error:", error);
      socketError.set(error.message);
    });

    this.socket.io.on("reconnect_attempt", (attempt) => {
      console.log(`[ws] reconnection attempt ${attempt}`);
      socketReconnecting.set(true);
    });

    this.socket.io.on("reconnect", (attempt) => {
      console.log(`[ws] reconnected after ${attempt} attempts`);
      socketReconnecting.set(false);
    });

    this.socket.io.on("reconnect_failed", () => {
      console.error("[ws] reconnection failed");
      socketError.set("Failed to reconnect");
    });
  }

  emit(event: string, data?: unknown) {
    if (!this.socket?.connected) {
      console.warn("[ws] socket not connected, queuing event:", event);
      return;
    }
    this.socket.emit(event, data);
  }

  on(event: string, callback: (...args: unknown[]) => void) {
    this.socket?.on(event, callback);
  }

  off(event: string, callback?: (...args: unknown[]) => void) {
    this.socket?.off(event, callback);
  }

  disconnect() {
    this.socket?.disconnect();
    this.socket = null;
  }

  get isConnected(): boolean {
    return this.socket?.connected ?? false;
  }
}

export const socketManager = new SocketManager();
