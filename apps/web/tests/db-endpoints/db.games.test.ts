import { beforeAll, describe, test } from "bun:test";
import { styleText } from "node:util";
import { db } from "@transc/db";
import { users } from "@transc/db/schema";
import { eq } from "drizzle-orm";
import {
  type CreateGameInput,
  dbAddSpectator,
  dbCreateGame,
  dbEndGame,
  dbGetGame,
  dbGetSpectators,
  dbGetSpectatorsCount,
  dbRemoveSpectator,
  dbStartGame,
  dbUpdateGame,
  type Game,
} from "$lib/db-services";

async function getUserId(username: string): Promise<number> {
  const [user] = await db
    .select({ id: users.id })
    .from(users)
    .where(eq(users.username, username))
    .limit(1);

  return user.id;
}

describe("games.service.ts tests", () => {
  let gameId: number;
  let player1: number;
  let player2: number;
  let spectator: number;
  beforeAll(async () => {
    player1 = await getUserId("Valentin");
    player2 = await getUserId("Erwan");
    spectator = await getUserId("Simon");
  });

  test("createGame", async () => {
    try {
      const gameInput: CreateGameInput = {
        whiteUserId: player1,
        blackUserId: player2,
        timeControlSeconds: 60,
        incrementSeconds: 0,
      };

      gameId = await dbCreateGame(gameInput);

      console.log(
        styleText("bold", "Game created with ID: ") +
          styleText(["bold", "yellow"], `${gameId}`),
      );
    } catch (err) {
      console.error(err);
    }
  });

  test("startGame", async () => {
    try {
      await dbStartGame(gameId);
    } catch (err) {
      console.error(err);
    }
  });

  test("updateGame", async () => {
    try {
      const gameInfo: Game = await dbUpdateGame(
        gameId,
        "rnbqkbnr/pppppppp/8/8/4P3/8/PPPP1PPP/RNBQKBNR w KQkq - 0 1",
      );

      console.table(gameInfo);
    } catch (err) {
      console.error(err);
    }
  });

  test("getGame", async () => {
    try {
      const gameInfo = await dbGetGame(gameId);

      console.table(gameInfo);
    } catch (err) {
      console.error(err);
    }
  });

  test("addSpectator", async () => {
    try {
      await dbAddSpectator(gameId, spectator);
    } catch (err) {
      console.error(err);
    }
  });

  test("getSpectators", async () => {
    try {
      const spectators = await dbGetSpectators(gameId);

      console.table(spectators);
    } catch (err) {
      console.error(err);
    }
  });

  test("getSpectatorsCount", async () => {
    try {
      const spectatorsCount = await dbGetSpectatorsCount(gameId);

      console.log(
        styleText("bold", "Spectators count: ") +
          styleText(["bold", "yellow"], `${spectatorsCount}`),
      );
    } catch (err) {
      console.error(err);
    }
  });

  test("removeSpectator", async () => {
    try {
      await dbRemoveSpectator(gameId, spectator);
    } catch (err) {
      console.error(err);
    }
  });

  test("endGame", async () => {
    try {
      await dbEndGame({ gameId: gameId, result: "draw" });
    } catch (err) {
      console.error(err);
    }
  });
});
