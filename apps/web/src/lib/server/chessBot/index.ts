// Run `bun run ./apps/web/src/lib/server/chessBot/internal/test.bot.ts` to see the bot play

// To use bot without WebWorker, use this instead as `findBestMoveTimed(state)`
export { findBestMoveTimed } from "./internal/bot/main";

// Use this to use WebWorker
export { getBotMove } from "./internal/chessBot";

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
