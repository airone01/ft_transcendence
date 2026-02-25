import { parentPort, workerData } from "worker_threads";
import { findBestMoveTimed } from "./bot/main";

const { state } = workerData;
const bestMove = findBestMoveTimed(state);

parentPort?.postMessage({ bestMove });

// Into .../+page.server.ts (to check if worker is working as expected)

/* import { getBotMove } from "$lib/server/chessBot";
import type { GameState } from "$lib/chess";
import { fail } from "@sveltejs/kit";

export const actions = {
  move: async ({ request }: { request: Request }) => {
    const data = await request.formData();
    const state = data.get("state") as GameState | null;

    if (!state) return fail(400);

    const bestMove = await getBotMove(state);

    return { bestMove };
  },
};
 */
