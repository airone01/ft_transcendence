import { db } from "@transc/db";
import {
  games,
  gamesPlayers,
  gamesSpectators,
  usersStats,
} from "@transc/db/schema";
import { and, count, DrizzleQueryError, eq, inArray, sql } from "drizzle-orm";
import type { DatabaseError } from "pg";
import {
  type CreateGameInput,
  DBGameNotFoundError,
  DBPlayersNotFoundError,
  DBRemoveSpectatorError,
  DBUserNotFoundError,
  type EndGameInput,
  type Game,
  UnknownError,
} from "$lib/db-services";

/**
 * Creates a new game in the database.
 * @param {CreateGameInput} gameInput - The input to create a new game, including the IDs of the white and black players, and the time control and increment in seconds.
 * @throws {DBPlayersNotFoundError} - If either of the players is not found in the database
 * @throws {UnknownError} - If an unexpected error occurs
 * @returns {Promise<number>} - A promise that resolves with the ID of the created game, or rejects if either of the players is not found or an unexpected error occurs
 */
export async function dbCreateGame(
  gameInput: CreateGameInput,
): Promise<number> {
  try {
    const gameId = await db.transaction(async (tx) => {
      const [game] = await db
        .insert(games)
        .values({
          timeControlSeconds: gameInput.timeControlSeconds,
          incrementSeconds: gameInput.incrementSeconds,
        })
        .returning();

      const elos = await tx
        .select({
          userId: usersStats.userId,
          elo: usersStats.currentElo,
        })
        .from(usersStats)
        .where(
          inArray(usersStats.userId, [
            gameInput.whiteUserId,
            gameInput.blackUserId,
          ]),
        );

      if (elos.length !== 2) throw new DBPlayersNotFoundError();

      const findWhite = elos.find((e) => e.userId === gameInput.whiteUserId);
      const findBlack = elos.find((e) => e.userId === gameInput.blackUserId);
      if (!findWhite || !findBlack) throw new DBPlayersNotFoundError();

      const players = await tx
        .insert(gamesPlayers)
        .values([
          {
            gameId: game.id,
            userId: gameInput.whiteUserId,
            color: "white",
            eloBefore: findWhite.elo,
          },
          {
            gameId: game.id,
            userId: gameInput.blackUserId,
            color: "black",
            eloBefore: findBlack.elo,
          },
        ])
        .returning();

      if (players.length !== 2) throw new DBPlayersNotFoundError();

      return game.id;
    });

    return gameId;
  } catch (err) {
    if (err instanceof DBPlayersNotFoundError) throw err;

    console.error(err);
    throw new UnknownError();
  }
}

/**
 * Starts a game by updating its status to "ongoing" and setting the startedAt timestamp.
 * @param {number} gameId - The id of the game to start
 * @throws {DBGameNotFoundError} - If the game is not found
 * @throws {UnknownError} - If an unexpected error occurs
 * @returns {Promise<void>} - A promise that resolves when the game has been successfully started
 */
export async function dbStartGame(gameId: number): Promise<void> {
  try {
    const [game] = await db
      .update(games)
      .set({
        status: "ongoing",
        startedAt: new Date(),
      })
      .where(eq(games.id, gameId))
      .returning();

    if (!game) throw new DBGameNotFoundError();
  } catch (err) {
    if (err instanceof DBGameNotFoundError) throw err;

    console.error(err);
    throw new UnknownError();
  }
}

/**
 * Retrieves a game from the database by its ID.
 * @param {number} gameId - The ID of the game to retrieve
 * @throws {DBGameNotFoundError} - If the game is not found
 * @throws {UnknownError} - If an unexpected error occurs
 * @returns {Promise<Game>} - A promise that resolves with the game info if found, or rejects if the game is not found or an unexpected error occurs
 */
export async function dbGetGame(gameId: number): Promise<Game> {
  try {
    const [game] = await db.select().from(games).where(eq(games.id, gameId));

    if (!game) throw new DBGameNotFoundError();

    return game;
  } catch (err) {
    if (err instanceof DBGameNotFoundError) throw err;

    console.error(err);
    throw new UnknownError();
  }
}

/**
 * Updates a game in the database with a new FEN string.
 * @param {number} gameId - The ID of the game to update
 * @param {string} newFen - The new FEN string to update the game with
 * @throws {DBGameNotFoundError} - If the game is not found
 * @throws {UnknownError} - If an unexpected error occurs
 * @returns {Promise<Game>} - A promise that resolves with the updated game info if found, or rejects if the game is not found or an unexpected error occurs
 */
export async function dbUpdateGame(
  gameId: number,
  newFen: string,
): Promise<Game> {
  try {
    const [game] = await db
      .update(games)
      .set({
        fen: newFen,
      })
      .where(eq(games.id, gameId))
      .returning();

    if (!game) throw new DBGameNotFoundError();

    return game;
  } catch (err) {
    if (err instanceof DBGameNotFoundError) throw err;

    console.error(err);
    throw new UnknownError();
  }
}

function EloRating(
  rA: number,
  rB: number,
  k: number,
  result: string,
): [number, number] {
  const eA = 1.0 / (1 + 10 ** ((rB - rA) / 400.0));
  const eB = 1.0 / (1 + 10 ** ((rA - rB) / 400.0));

  let outcome: number = 0.5;
  if (result === "A") outcome = 1;
  else if (result === "B") outcome = 0;

  return [
    Math.round(rA + k * (outcome - eA)),
    Math.round(rB + k * (1 - outcome - eB)),
  ];
}

/**
 * Ends a game by updating its status to "finished", setting the endedAt timestamp, and updating the elo ratings of the players.
 * @param {EndGameInput} endGameInput - The input to end the game with
 * @throws {DBGameNotFoundError} - If the game is not found
 * @throws {DBPlayersNotFoundError} - If the players are not found
 * @throws {UnknownError} - If an unexpected error occurs
 * @returns {Promise<void>} - A promise that resolves when the game has been successfully ended, or rejects if the game is not found, the players are not found, or an unexpected error occurs
 */
export async function dbEndGame(endGameInput: EndGameInput): Promise<void> {
  try {
    await db.transaction(async (tx) => {
      const [game] = await tx
        .update(games)
        .set({
          status: "finished",
          result: endGameInput.result,
          endedAt: new Date(),
        })
        .where(eq(games.id, endGameInput.gameId))
        .returning();

      if (!game) throw new DBGameNotFoundError();

      const [p1, p2] = await tx
        .select()
        .from(gamesPlayers)
        .where(eq(gamesPlayers.gameId, endGameInput.gameId))
        .limit(2);

      if (!p1 || !p2) throw new DBPlayersNotFoundError();

      let result: "A" | "B" | "draw" = "draw";
      if (endGameInput.result === "white_win")
        result = p1.color === "white" ? "A" : "B";
      else if (endGameInput.result === "black_win")
        result = p1.color === "black" ? "A" : "B";

      const [elo1, elo2] = EloRating(p1.eloBefore, p2.eloBefore, 30, result);

      const updatedPlayers = await tx
        .update(gamesPlayers)
        .set({
          eloAfter: sql`
          CASE
            WHEN ${gamesPlayers.userId} = ${p1.userId}
              THEN CAST(${elo1} AS INTEGER)
            ELSE CAST(${elo2} AS INTEGER)
          END
        `,
        })
        .where(eq(gamesPlayers.gameId, game.id))
        .returning();

      if (updatedPlayers.length !== 2) throw new DBPlayersNotFoundError();

      const updatedUsers = await tx
        .update(usersStats)
        .set({
          currentElo: sql`
          CASE
            WHEN ${usersStats.userId} = ${p1.userId}
              THEN CAST(${elo1} AS INTEGER)
            ELSE CAST(${elo2} AS INTEGER)
          END
        `,
          updatedAt: new Date(),
        })
        .where(inArray(usersStats.userId, [p1.userId, p2.userId]))
        .returning();

      if (updatedUsers.length !== 2) throw new DBPlayersNotFoundError();

      const removedSpectators = await tx
        .delete(gamesSpectators)
        .where(eq(gamesSpectators.gameId, game.id))
        .returning();

      if (!removedSpectators) throw new DBGameNotFoundError();
    });
  } catch (err) {
    if (err instanceof DBGameNotFoundError) throw err;
    if (err instanceof DBPlayersNotFoundError) throw err;

    console.error(err);
    throw new UnknownError();
  }
}

/**
 * Retrieves the IDs of the players in a game.
 * @param {number} gameId - The id of the game to retrieve the players for
 * @throws {DBPlayersNotFoundError} - If the players are not found
 * @throws {UnknownError} - If an unexpected error occurs
 * @returns {Promise<{ whitePlayerId: number; blackPlayerId: number }>} - A promise that resolves with the IDs of the players if found, or rejects if the players are not found or an unexpected error occurs
 */
export async function dbGetPlayers(
  gameId: number,
): Promise<{ whitePlayerId: number; blackPlayerId: number }> {
  try {
    const players = await db
      .select({ user_id: gamesPlayers.userId, color: gamesPlayers.color })
      .from(gamesPlayers)
      .where(eq(gamesPlayers.gameId, gameId))
      .limit(2);

    if (players.length !== 2) throw new DBPlayersNotFoundError();

    return {
      whitePlayerId:
        players[0].color === "white" ? players[0].user_id : players[1].user_id,
      blackPlayerId:
        players[0].color === "black" ? players[0].user_id : players[1].user_id,
    };
  } catch (err) {
    if (err instanceof DBPlayersNotFoundError) throw err;

    console.error(err);
    throw new UnknownError();
  }
}

/**
 * Adds a spectator to a game.
 * @param {number} gameId - The id of the game to add the spectator to
 * @param {number} userId - The id of the user to add as a spectator
 * @throws {DBGameNotFoundError} - If the game is not found
 * @throws {DBUserNotFoundError} - If the user is not found
 * @throws {UnknownError} - If an unexpected error occurs
 * @returns {Promise<void>} - A promise that resolves when the spectator has been successfully added, or rejects if the game or user is not found or an unexpected error occurs
 */
export async function dbAddSpectator(
  gameId: number,
  userId: number,
): Promise<void> {
  try {
    const [spectator] = await db
      .insert(gamesSpectators)
      .values({
        gameId: gameId,
        userId: userId,
      })
      .returning();

    if (!spectator) throw new UnknownError();
  } catch (err) {
    if (err instanceof UnknownError) throw err;

    if (err instanceof DrizzleQueryError) {
      const cause = err.cause;

      if (cause && typeof cause === "object" && "code" in cause) {
        const pgError = cause as DatabaseError;

        if (pgError.code === "23503") {
          if (
            pgError.constraint &&
            pgError.constraint === "games_spectators_game_id_games_id_fk"
          )
            throw new DBGameNotFoundError();
          else if (
            pgError.constraint &&
            pgError.constraint === "games_spectators_user_id_users_id_fk"
          )
            throw new DBUserNotFoundError();
        }
      }
    }

    console.error(err);
    throw new UnknownError();
  }
}

/**
 * Removes a spectator from a game.
 * @param {number} gameId - The id of the game to remove the spectator from
 * @param {number} userId - The id of the user to remove as a spectator
 * @throws {DBRemoveSpectatorError} - If the game or spectator is not found
 * @throws {UnknownError} - If an unexpected error occurs
 * @returns {Promise<void>} - Resolves when the spectator has been removed
 */
export async function dbRemoveSpectator(
  gameId: number,
  userId: number,
): Promise<void> {
  try {
    const [spectator] = await db
      .delete(gamesSpectators)
      .where(
        and(
          eq(gamesSpectators.gameId, gameId),
          eq(gamesSpectators.userId, userId),
        ),
      )
      .returning();

    if (!spectator) throw new DBRemoveSpectatorError();
  } catch (err) {
    if (err instanceof DBRemoveSpectatorError) throw err;

    console.error(err);
    throw new UnknownError();
  }
}

/**
 * Retrieves a list of spectators for a given game.
 * @param {number} gameId - The id of the game to retrieve spectators for
 * @throws {UnknownError} - If an unexpected error occurs
 * @returns {Promise<{ userId: number }[]>} - A promise that resolves with a list of spectators, or rejects if an unexpected error occurs
 */
export async function dbGetSpectators(
  gameId: number,
): Promise<{ userId: number }[]> {
  try {
    const spectators = await db
      .select({ userId: gamesSpectators.userId })
      .from(gamesSpectators)
      .where(eq(gamesSpectators.gameId, gameId));

    return spectators;
  } catch (err) {
    console.error(err);
    throw new UnknownError();
  }
}

/**
 * Retrieves the count of spectators for a given game.
 * @param {number} gameId - The id of the game to retrieve spectators count for
 * @throws {UnknownError} - If an unexpected error occurs
 * @returns {Promise<number>} - A promise that resolves with the count of spectators, or rejects if an unexpected error occurs
 */
export async function dbGetSpectatorsCount(gameId: number): Promise<number> {
  try {
    const [spectatorCount] = await db
      .select({ count: count(gamesSpectators.gameId) })
      .from(gamesSpectators)
      .where(eq(gamesSpectators.gameId, gameId));

    return spectatorCount.count;
  } catch (err) {
    console.error(err);
    throw new UnknownError();
  }
}
