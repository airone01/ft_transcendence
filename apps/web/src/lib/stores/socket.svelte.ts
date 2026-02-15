import { io, type Socket } from "socket.io-client";
import { type Writable, writable } from "svelte/store";
import { browser } from "$app/environment";

// ─── Reactive stores (accessible from any component) ───────────

export const socketConnected: Writable<boolean> = writable(false);
export const socketReconnecting: Writable<boolean> = writable(false);
export const socketError: Writable<string | null> = writable(null);

// ─── SocketManager ───────────────────────────────────────────────────────────

class SocketManager {
  private socket: Socket | null = null;

  constructor() {
    if (browser) {
      this.connect();
    }
  }

  connect() {
    if (this.socket?.connected) return;

    // TODO: pass listen addr as env var
    this.socket = io("http://localhost:3000", {
      auth: {
        token: this.getToken(),
      },
      transports: ["websocket", "polling"],
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
      console.log("Socket connected");
      socketConnected.set(true);
      socketReconnecting.set(false);
      socketError.set(null);
    });

    this.socket.on("disconnect", (reason) => {
      console.log("Socket disconnected:", reason);
      socketConnected.set(false);

      if (reason === "io server disconnect") {
        this.socket?.connect();
      }
    });

    this.socket.on("connect_error", (error) => {
      console.error("Connection error:", error);
      socketError.set(error.message);
    });

    this.socket.io.on("reconnect_attempt", (attempt) => {
      console.log(`🔄 Reconnection attempt ${attempt}`);
      socketReconnecting.set(true);
    });

    this.socket.io.on("reconnect", (attempt) => {
      console.log(`Reconnected after ${attempt} attempts`);
      socketReconnecting.set(false);
    });

    this.socket.io.on("reconnect_failed", () => {
      console.error("Reconnection failed");
      socketError.set("Failed to reconnect");
    });
  }

  private getToken(): string | null {
    if (!browser) return null;
    return (
      document.cookie
        .split("; ")
        .find((row) => row.startsWith("session="))
        ?.split("=")[1] || null
    );
  }

  emit(event: string, data?: unknown) {
    if (!this.socket?.connected) {
      console.warn("Socket not connected, queuing event:", event);
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
