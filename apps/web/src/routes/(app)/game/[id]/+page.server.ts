import { error, redirect } from "@sveltejs/kit";
import {
  DBGameNotFoundError,
  dbGetGame,
  type Game,
} from "$lib/server/db-services";
import type { PageServerLoad } from "./$types";

export const load: PageServerLoad = async ({ params }) => {
  if (params.id.startsWith("bot-")) {
    return {};
  }

  const gameId = parseInt(params.id, 10);
  //INT MAX
  if (Number.isNaN(gameId) || gameId < 1 || gameId > 2_147_483_647) {
    throw redirect(302, "/play?error=game_not_found");
  }

  let game: Game;
  try {
    game = await dbGetGame(gameId);
  } catch (err) {
    if (err instanceof DBGameNotFoundError) {
      throw redirect(302, "/play?error=game_not_found");
    }
    throw error(500, "Failed to load game");
  }

  if (game.status === "finished") {
    throw redirect(302, "/play?error=game_not_found");
  }
};
