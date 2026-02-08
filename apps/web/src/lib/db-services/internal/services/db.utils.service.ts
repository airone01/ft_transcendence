import { db } from "@transc/db";
import { games, gamesPlayers, users, usersStats } from "@transc/db/schema";
import { and, desc, eq, ne } from "drizzle-orm";
import { alias } from "drizzle-orm/pg-core";
import {
  type GameHistory,
  type Leaderboard,
  UnknownError,
} from "$lib/db-services";

/**
 * Retrieves the leaderboard of users sorted by their elo in descending order.
 * The leaderboard only contains the top 20 users.
 * @throws {UnknownError} - If the leaderboard is not found, or if an unexpected error occurs
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

    return leaderboard as Leaderboard;
  } catch (err) {
    console.error(err);
    throw new UnknownError();
  }
}

/**
 * Retrieves the game history of a user.
 * The game history only contains the last 10 games a user has played, sorted in descending order by the end time of the game.
 * @param {number} userId - The id of the user to retrieve game history for
 * @throws {UnknownError} - If the game history is not found, or if an unexpected error occurs
 * @returns {Promise<GameHistory>} - Resolves with the game history of the user
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

    return history as GameHistory;
  } catch (err) {
    console.error(err);
    throw new UnknownError();
  }
}
