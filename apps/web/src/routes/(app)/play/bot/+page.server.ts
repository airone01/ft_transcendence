import type { GameState } from "$lib/chess";
import { getBotMove } from "$lib/server/chessBot";
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
