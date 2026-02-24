import type { GameState } from "$lib/chess";
import { Worker } from "worker_threads";

export function getBotMove(state: GameState): Promise<GameState> {
  return new Promise((resolve, reject) => {
    const worker = new Worker(
      new URL("./chessBot.worker.js", import.meta.url),
      { workerData: { state } },
    );

    worker.on("message", ({ bestMove }) => resolve(bestMove));
    worker.on("error", reject);
    worker.on("exit", (code) => {
      if (code !== 0) reject(new Error(`Worker exited with code ${code}`));
    });
  });
}
