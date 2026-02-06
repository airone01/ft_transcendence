import { db } from "@transc/db";
import { games, gamesPlayers, users, usersStats } from "@transc/db/schema";
import { and, desc, eq, ne } from "drizzle-orm";
import { alias } from "drizzle-orm/pg-core";
import type { GameHistory, Leaderboard } from "$lib/db-services";

/**
 * Retrieves the leaderboard of users sorted by their elo in descending order.
 * The leaderboard only contains the top 20 users.
 * @throws {Error} - If the leaderboard is not found, or if an unexpected error occurs
 * @returns {Promise<Leaderboard>} - Resolves with the leaderboard of users
 */
export async function dbGetLeaderboard(): Promise<Leaderboard> {
  try {
    const leaderboard = await db
      .select({
        userId: users.id,
        username: users.username,
        elo: usersStats.currentElo,
      })
      .from(users)
      .leftJoin(usersStats, eq(users.id, usersStats.userId))
      .orderBy(desc(usersStats.currentElo))
      .limit(20);

    if (!leaderboard) throw new Error("DB: Leaderboard not found");

    return leaderboard as Leaderboard;
  } catch (err) {
    console.error(err);
    throw err;
  }
}

/**
 * Retrieves the game history of a given user.
 * The game history contains the last 10 games of the user,
 * sorted in descending order by the end time of the game.
 * The game history includes the opponent's user id, username, past elo, and avatar.
 * @param {number} userId - The id of the user to retrieve game history for
 * @throws {Error} - If the game history is not found, or if an unexpected error occurs
 * @returns {Promise<GameHistory>} - A promise that resolves with the game history of the user
 */
export async function dbGetUserGameHistory(
  userId: number,
): Promise<GameHistory> {
  try {
    const gp1 = alias(gamesPlayers, "gp1");
    const gp2 = alias(gamesPlayers, "gp2");

    const history = await db
      .select({
        gameId: games.id,
        timeControlSeconds: games.timeControlSeconds,
        incrementSeconds: games.incrementSeconds,
        result: games.result,
        startedAt: games.startedAt,
        endedAt: games.endedAt,
        oppenentUserId: gp2.userId,
        oppenentUsername: users.username,
        oppenentPastElo: gp2.eloBefore,
        oppenentAvatar: users.avatar,
      })
      .from(gp1)
      .innerJoin(
        gp2,
        and(eq(gp1.gameId, gp2.gameId), ne(gp1.userId, gp2.userId)),
      )
      .innerJoin(games, eq(games.id, gp1.gameId))
      .innerJoin(users, eq(gp2.userId, users.id))
      .where(and(eq(gp1.userId, userId), eq(games.status, "finished")))
      .orderBy(desc(games.endedAt))
      .limit(10);

    if (!history) throw new Error("DB: Game history not found");

    return history as GameHistory;
  } catch (err) {
    console.error(err);
    throw err;
  }
}
