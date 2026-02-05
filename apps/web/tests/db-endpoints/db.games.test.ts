import { beforeAll, describe, test } from "bun:test";
import { db } from "@transc/db";
import { users } from "@transc/db/schema";
import { eq } from "drizzle-orm";
import {
  type CreateGameInput,
  dbCreateGame,
  dbStartGame,
  dbGetGame,
  dbUpdateGame,
} from "$lib/db-services";
import { dbEndGame } from "$lib/db-services/internal/services/db.games.service";
import { strategy } from "$lib/paraglide/runtime";

async function getUserId(username: string) {
  const [user] = await db
    .select({ id: users.id })
    .from(users)
    .where(eq(users.username, username))
    .limit(1);

  return user.id;
}

let player1: number;
let player2: number;
beforeAll(async () => {
  player1 = await getUserId("Valentin");
  player2 = await getUserId("Erwan");
});

describe.only("games.service.ts tests", () => {
  test("createGame", async () => {
    try {
      const gameInput: CreateGameInput = {
        whiteUserId: player1,
        blackUserId: player2,
        timeControlSeconds: 60,
        incrementSeconds: 0,
      };

      await dbCreateGame(gameInput);
    } catch (err) {
      console.error(err);
    }
  });

  test("startGame", async () => {
    try {
      await dbStartGame(45);
    } catch (err) {
      console.error(err);
    }
  });

  test("updateGame", async () => {
    try {
      const game = await dbUpdateGame(
        45,
        "rnbqkbnr/pppppppp/8/8/4P3/8/PPPP1PPP/RNBQKBNR w KQkq - 0 1",
      );

      console.table(game);
    } catch (err) {
      console.error(err);
    }
  });

  test("getGame", async () => {
    try {
      const game = await dbGetGame(45);
    } catch (err) {
      console.error(err);
    }
  });

  test.only("endGame", async () => {
    try {
      const gameId = await dbCreateGame({
        whiteUserId: player1,
        blackUserId: player2,
        timeControlSeconds: 60,
        incrementSeconds: 0,
      });

      await dbStartGame(gameId);
      await dbEndGame({ gameId: gameId, result: "draw" });
    } catch (err) {
      console.error(err);
    }
  });
});
