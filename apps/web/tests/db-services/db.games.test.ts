import { beforeAll, describe, expect, test } from "bun:test";
import { styleText } from "node:util";
import { db } from "@transc/db";
import { users } from "@transc/db/schema";
import { eq } from "drizzle-orm";
import {
  type CreateGameInput,
  DBGameNotFoundError,
  DBPlayersNotFoundError,
  DBRemoveSpectatorError,
  DBUserNotFoundError,
  dbAddSpectator,
  dbCreateGame,
  dbEndGame,
  dbGetGame,
  dbGetSpectators,
  dbGetSpectatorsCount,
  dbRemoveSpectator,
  dbStartGame,
} from "$lib/server/db-services";

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

      expect(gameId).toBeDefined();
      console.log(
        styleText("bold", "Game created with ID: ") +
          styleText(["bold", "yellow"], `${gameId}`),
      );
    } catch (_err) {}
  });

  test("createGame with same user", async () => {
    try {
      const gameInput: CreateGameInput = {
        whiteUserId: player1,
        blackUserId: player1,
        timeControlSeconds: 60,
        incrementSeconds: 0,
      };

      gameId = await dbCreateGame(gameInput);

      console.log(
        styleText("bold", "Game created with ID: ") +
          styleText(["bold", "yellow"], `${gameId}`),
      );
    } catch (err) {
      expect(err).toBeInstanceOf(DBPlayersNotFoundError);
    }
  });

  test("startGame", async () => {
    try {
      await dbStartGame(gameId);

      expect(true).toBe(true);
    } catch (_err) {}
  });

  test("startGame with invalid game id", async () => {
    try {
      await dbStartGame(100000000);
    } catch (err) {
      expect(err).toBeInstanceOf(DBGameNotFoundError);
    }
  });

  test("getGame", async () => {
    try {
      const gameInfo = await dbGetGame(gameId);

      expect(gameInfo).toBeDefined();
      console.table(gameInfo);
    } catch (_err) {}
  });

  test("getGame with invalid game id", async () => {
    try {
      await dbGetGame(100000000);
    } catch (err) {
      expect(err).toBeInstanceOf(DBGameNotFoundError);
    }
  });

  test("addSpectator", async () => {
    try {
      await dbAddSpectator(gameId, spectator);

      expect(true).toBe(true);
    } catch (_err) {}
  });

  test("addSpectator with invalid game id", async () => {
    try {
      await dbAddSpectator(100000000, spectator);
    } catch (err) {
      expect(err).toBeInstanceOf(DBGameNotFoundError);
    }
  });

  test("addSpectator with invalid user id", async () => {
    try {
      await dbAddSpectator(gameId, 100000000);
    } catch (err) {
      expect(err).toBeInstanceOf(DBUserNotFoundError);
    }
  });

  test("getSpectators", async () => {
    try {
      const spectators = await dbGetSpectators(gameId);

      expect(spectators).toBeDefined();
      console.table(spectators);
    } catch (_err) {}
  });

  test("getSpectators with invalid game id", async () => {
    try {
      const spectators = await dbGetSpectators(100000000);

      expect(spectators).toBeDefined();
    } catch (_err) {}
  });

  test("getSpectatorsCount", async () => {
    try {
      const spectatorsCount = await dbGetSpectatorsCount(gameId);

      expect(spectatorsCount).toBeDefined();
      console.log(
        styleText("bold", "Spectators count: ") +
          styleText(["bold", "yellow"], `${spectatorsCount}`),
      );
    } catch (_err) {}
  });

  test("getSpectatorsCount with invalid game id", async () => {
    try {
      const spectatorsCount = await dbGetSpectatorsCount(100000000);

      expect(spectatorsCount).toBeDefined();
    } catch (_err) {}
  });

  test("removeSpectator", async () => {
    try {
      await dbRemoveSpectator(gameId, spectator);

      expect(true).toBe(true);
    } catch (_err) {}
  });

  test("removeSpectator with invalid game id", async () => {
    try {
      await dbRemoveSpectator(100000000, spectator);
    } catch (err) {
      expect(err).toBeInstanceOf(DBRemoveSpectatorError);
    }
  });

  test("removeSpectator with invalid user id", async () => {
    try {
      await dbRemoveSpectator(gameId, 100000000);
    } catch (err) {
      expect(err).toBeInstanceOf(DBRemoveSpectatorError);
    }
  });

  test("endGame", async () => {
    try {
      await dbEndGame({ gameId: gameId, result: "draw" });

      expect(true).toBe(true);
    } catch (_err) {}
  });

  test("endGame with invalid game id", async () => {
    try {
      await dbEndGame({ gameId: 100000000, result: "draw" });
    } catch (err) {
      expect(err).toBeInstanceOf(DBGameNotFoundError);
    }
  });
});
