import { redirect } from "@sveltejs/kit";
import { dbGetGame } from "$lib/server/db-services";
import { DBGameNotFoundError } from "$lib/server/db-services";
import type { PageServerLoad } from "./$types";
import { toast } from "svelte-sonner";

export const load: PageServerLoad = async ({ params }) => {
  const gameId = parseInt(params.id, 10);
  if (isNaN(gameId) || params.id.startsWith("bot-")) {
    throw redirect(302, "/play?error=game_not_found");
  }

  try {
    await dbGetGame(gameId);
  } catch (err) {
    if (err instanceof DBGameNotFoundError) {
      throw redirect(302, "/play?error=game_not_found");
    }
    throw redirect(302, "/play?error=game_not_found");
  }
};