import { db } from "@transc/db";
import { friendships, users, usersStats } from "@transc/db/schema";
import { and, eq, ne, or } from "drizzle-orm";
import type { FriendInfo } from "../schema/db.users.schema";

/**
 * Adds a new friendship between two users.
 * @param {number} userId - The id of the first user
 * @param {number} friendId - The id of the second user
 * @throws {Error} - If the friendship is not added
 * @returns {Promise<void>} - Resolves when the friendship has been added
 */
export async function dbAddFriend(
  userId: number,
  friendId: number,
): Promise<void> {
  try {
    const [friendship] = await db
      .insert(friendships)
      .values({
        firstFriendId: Math.min(userId, friendId),
        secondFriendId: Math.max(userId, friendId),
      })
      .returning();

    if (!friendship) throw new Error("DB: Friendship not added");
  } catch (err) {
    console.error(err);
    throw err;
  }
}

/**
 * Removes a friendship between two users.
 * @param {number} userId - The id of the first user
 * @param {number} friendId - The id of the second user
 * @throws {Error} - If the friendship is not removed
 * @returns {Promise<void>} - Resolves when the friendship has been removed
 */
export async function dbRemoveFriend(
  userId: number,
  friendId: number,
): Promise<void> {
  try {
    const [friendship] = await db
      .delete(friendships)
      .where(
        or(
          and(
            eq(friendships.firstFriendId, userId),
            eq(friendships.secondFriendId, friendId),
          ),
          and(
            eq(friendships.firstFriendId, friendId),
            eq(friendships.secondFriendId, userId),
          ),
        ),
      )
      .returning();

    if (!friendship) throw new Error("DB: Friendship not removed");
  } catch (err) {
    console.error(err);
    throw err;
  }
}

/**
 * Retrieves a list of friends for a given user.
 * @param {number} userId - The id of the user to retrieve friends for
 * @throws {Error} - If the user does not exist, or if an unexpected error occurs
 * @returns {Promise<FriendInfo[]>} - Resolves with a list of friends
 */
export async function dbGetFriendsInfo(userId: number): Promise<FriendInfo[]> {
  try {
    const friends = await db
      .select({
        userId: users.id,
        username: users.username,
        avatar: users.avatar,
        status: users.status,
        currentElo: usersStats.currentElo,
      })
      .from(friendships)
      .innerJoin(
        users,
        or(
          eq(friendships.firstFriendId, users.id),
          eq(friendships.secondFriendId, users.id),
        ),
      )
      .innerJoin(usersStats, eq(users.id, usersStats.userId))
      .where(
        and(
          or(
            eq(friendships.firstFriendId, userId),
            eq(friendships.secondFriendId, userId),
          ),
          ne(users.id, userId),
        ),
      );

    return friends as FriendInfo[];
  } catch (err) {
    console.error(err);
    throw err;
  }
}
