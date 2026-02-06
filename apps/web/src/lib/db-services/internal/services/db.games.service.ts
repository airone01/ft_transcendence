import { db } from "@transc/db";
import {
  games,
  gamesPlayers,
  gamesSpectators,
  usersStats,
} from "@transc/db/schema";
import { and, count, eq } from "drizzle-orm";
import type { CreateGameInput, EndGameInput, Game } from "$lib/db-services";

const getElo = async (userId: number) => {
  return await db
    .select({ elo: usersStats.currentElo })
    .from(usersStats)
    .where(eq(usersStats.userId, userId));
};

/**
 * Creates a new game in the database.
 * @param {CreateGameInput} gameInput - The input for creating a new game, including the IDs of the players and the time control and increment values.
 * @returns {Promise<number>} - The ID of the created game.
 * @throws {Error} - If the game creation fails, it throws an error.
 */
export async function dbCreateGame(
  gameInput: CreateGameInput,
): Promise<number> {
  try {
    const [game] = await db
      .insert(games)
      .values({
        timeControlSeconds: gameInput.timeControlSeconds,
        incrementSeconds: gameInput.incrementSeconds,
        createdAt: new Date(),
      })
      .returning();

    if (!game) throw new Error("DB: Game not created");

    const [whitePlayerElo] = await getElo(gameInput.whiteUserId);
    const [blackPlayerElo] = await getElo(gameInput.blackUserId);

    if (!whitePlayerElo || !blackPlayerElo)
      throw new Error("DB: Player elo not found");

    const [whitePlayer] = await db
      .insert(gamesPlayers)
      .values({
        gameId: game.id,
        userId: gameInput.whiteUserId,
        color: "white",
        eloBefore: whitePlayerElo.elo,
      })
      .returning();

    const [blackPlayer] = await db
      .insert(gamesPlayers)
      .values({
        gameId: game.id,
        userId: gameInput.blackUserId,
        color: "black",
        eloBefore: blackPlayerElo.elo,
      })
      .returning();

    if (!whitePlayer || !blackPlayer)
      throw new Error("DB: White or black player not added");

    return game.id;
  } catch (err) {
    console.error(err);
    throw err;
  }
}

/**
 * Starts a game by updating its status to "ongoing" and setting the startedAt timestamp
 * @param {number} gameId - The id of the game to start
 * @throws {Error} - If the game is not found or if an unexpected error occurs
 * @returns {Promise<void>} - Resolves when the game has been successfully started
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

    if (!game) throw new Error("DB: Game not started");
  } catch (err) {
    console.error(err);
    throw err;
  }
}

/**
 * Retrieves a game by its id, including the number of spectators.
 * @param {number} gameId - The id of the game to retrieve
 * @throws {Error} - If the game is not found or if an unexpected error occurs
 * @returns {Promise<Game>}- Resolves with the game info, including the number of spectators
 */
export async function dbGetGame(gameId: number): Promise<Game> {
  try {
    const [game] = await db.select().from(games).where(eq(games.id, gameId));

    if (!game) throw new Error("DB: Game not found");

    return game as Game;
  } catch (err) {
    console.error(err);
    throw err;
  }
}

/**
 * Updates a game in the database with a new FEN string.
 * @param {number} gameId - The id of the game to update
 * @param {string} newFen - The new FEN string to update the game with
 * @throws {Error} - If the game is not found or if an unexpected error occurs
 * @returns {Promise<Game>} - Resolves with the updated game info
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

    if (!game) throw new Error("DB: Game not updated");

    return game as Game;
  } catch (err) {
    console.error(err);
    throw err;
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
 * Ends a game by updating its status to "finished" and setting the endedAt timestamp, and also updates the elo of the players in the game
 * @param {EndGameInput} endGameInput - The input to end the game
 * @throws {Error} - If the game is not found or if an unexpected error occurs
 * @returns {Promise<void>} - Resolves when the game has been successfully ended
 */
export async function dbEndGame(endGameInput: EndGameInput): Promise<void> {
  try {
    const [game] = await db
      .update(games)
      .set({
        status: "finished",
        result: endGameInput.result,
        endedAt: new Date(),
      })
      .where(eq(games.id, endGameInput.gameId))
      .returning();

    if (!game) throw new Error("DB: Game not ended");

    const [gamePlayer1, gamePlayer2] = await db
      .select()
      .from(gamesPlayers)
      .where(eq(gamesPlayers.gameId, endGameInput.gameId))
      .limit(2);

    if (!gamePlayer1 || !gamePlayer2) throw new Error("DB: Game not found");

    let result: string = "draw";
    if (endGameInput.result === "white_win")
      result = gamePlayer1.color === "white" ? "A" : "B";
    else if (endGameInput.result === "black_win")
      result = gamePlayer1.color === "black" ? "A" : "B";

    const [newPlayer1Elo, newPlayer2Elo] = EloRating(
      gamePlayer1.eloBefore,
      gamePlayer2.eloBefore,
      30,
      result,
    );

    const gamePlayer1Updated = await db
      .update(gamesPlayers)
      .set({
        eloAfter: newPlayer1Elo,
      })
      .where(
        and(
          eq(gamesPlayers.gameId, game.id),
          eq(gamesPlayers.userId, gamePlayer1.userId),
        ),
      )
      .returning();

    const gamePlayer2Updated = await db
      .update(gamesPlayers)
      .set({
        eloAfter: newPlayer2Elo,
      })
      .where(
        and(
          eq(gamesPlayers.gameId, game.id),
          eq(gamesPlayers.userId, gamePlayer2.userId),
        ),
      )
      .returning();

    if (!gamePlayer1Updated || !gamePlayer2Updated)
      throw new Error("DB: Game player not updated");

    const user1Updated = await db
      .update(usersStats)
      .set({
        currentElo: newPlayer1Elo,
        updatedAt: new Date(),
      })
      .where(eq(usersStats.userId, gamePlayer1.userId))
      .returning();

    const user2Updated = await db
      .update(usersStats)
      .set({
        currentElo: newPlayer2Elo,
        updatedAt: new Date(),
      })
      .where(eq(usersStats.userId, gamePlayer2.userId))
      .returning();

    if (!user1Updated || !user2Updated) throw new Error("DB: User not updated");

    const removedSpectators = await db
      .delete(gamesSpectators)
      .where(eq(gamesSpectators.gameId, game.id))
      .returning();

    if (!removedSpectators) throw new Error("DB: Spectators not removed");
  } catch (err) {
    console.error(err);
    throw err;
  }
}

/**
 * Adds a new spectator to a game.
 * @param {number} gameId - The id of the game to add the spectator to
 * @param {number} userId - The id of the user to add as a spectator
 * @throws {Error} - If the game does not exist, or if the user is already a spectator
 * @returns {Promise<void>} - Resolves when the spectator has been added
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

    if (!spectator) throw new Error("DB: Spectator not added");
  } catch (err) {
    console.error(err);
    throw err;
  }
}

/**
 * Removes a spectator from a game.
 * @param {number} gameId - The id of the game to remove the spectator from
 * @param {number} userId - The id of the user to remove as a spectator
 * @throws {Error} - If the game does not exist, or if the user is not a spectator
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

    if (!spectator) throw new Error("DB: Spectator not removed");
  } catch (err) {
    console.error(err);
    throw err;
  }
}

/**
 * Retrieves a list of users who are spectators of a game.
 * @param {number} gameId - The id of the game to retrieve spectators from
 * @throws {Error} - If the game does not exist, or if an unexpected error occurs
 * @returns {Promise<{ userId: number }[]>} - Resolves with a list of spectators
 */
export async function dbGetSpectators(
  gameId: number,
): Promise<{ userId: number }[]> {
  try {
    const spectators = await db
      .select({ userId: gamesSpectators.userId })
      .from(gamesSpectators)
      .where(eq(gamesSpectators.gameId, gameId));

    if (!spectators) throw new Error("DB: Spectators not found");

    return spectators;
  } catch (err) {
    console.error(err);
    throw err;
  }
}

/**
 * Retrieves the number of spectators for a game.
 * @param {number} gameId - The id of the game to retrieve spectators count from
 * @throws {Error} - If the game does not exist, or if an unexpected error occurs
 * @returns {Promise<number>} - Resolves with the number of spectators
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
    throw err;
  }
}
