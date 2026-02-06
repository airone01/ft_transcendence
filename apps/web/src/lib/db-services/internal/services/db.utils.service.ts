import { db } from "@transc/db";
import { users, usersStats } from "@transc/db/schema";
import { desc, eq } from "drizzle-orm";
import type { Leaderboard } from "$lib/db-services";

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
