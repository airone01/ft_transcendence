import type { Server } from "socket.io";

let heartbeatInterval: ReturnType<typeof setInterval> | null = null;

export function startHeartbeat(io: Server, intervalMs = 30000) {
  if (heartbeatInterval) return; // Déjà lancé

  heartbeatInterval = setInterval(() => {
    // Broadcast un ping à tous les clients
    io.emit("heartbeat:ping", { timestamp: Date.now() });
  }, intervalMs);

  console.log(`[Heartbeat] Started, interval: ${intervalMs}ms`);
}

export function stopHeartbeat() {
  if (heartbeatInterval) {
    clearInterval(heartbeatInterval);
    heartbeatInterval = null;
    console.log("[Heartbeat] Stopped");
  }
}
