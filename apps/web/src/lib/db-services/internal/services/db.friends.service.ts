import { db } from "@transc/db";
import { friendships, users, usersStats } from "@transc/db/schema";
import { and, DrizzleQueryError, eq, ne, or } from "drizzle-orm";
import type { DatabaseError } from "pg";
import {
  DBAddFriendFriendshipAlreadyExistsError,
  DBAddFriendWrongFriendshipError,
  DBUserNotFoundError,
  type FriendInfo,
  UnknownError,
} from "$lib/db-services";

/**
 * Adds a friend to a user.
 * @param {number} userId - The id of the user to add a friend to
 * @param {number} friendId - The id of the friend to add
 * @throws {DBAddFriendFriendshipAlreadyExistsError} - If the two users are already friends
 * @throws {DBAddFriendWrongFriendshipError} - If the two users are the same person
 * @throws {DBUserNotFoundError} - If the user or friend is not found
 * @throws {UnknownError} - If an unexpected error occurs
 * @returns {Promise<void>} - Resolves when the friend has been successfully added
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

    if (!friendship) throw new DBUserNotFoundError();
  } catch (err) {
    if (err instanceof DBUserNotFoundError) throw err;

    if (err instanceof DrizzleQueryError) {
      const cause = err.cause;

      if (cause && typeof cause === "object" && "code" in cause) {
        const pgError = cause as DatabaseError;

        if (pgError.code === "23503") {
          if (
            pgError.constraint &&
            (pgError.constraint === "friendships_first_friend_id_users_id_fk" ||
              pgError.constraint === "friendships_second_friend_id_users_id_fk")
          )
            throw new DBUserNotFoundError();
        }

        if (pgError.code === "23505") {
          if (
            pgError.constraint &&
            pgError.constraint ===
              "friendships_first_friend_id_second_friend_id_pk"
          )
            throw new DBAddFriendFriendshipAlreadyExistsError();
        }

        if (pgError.code === "23514") {
          if (
            pgError.constraint &&
            pgError.constraint === "friendships_duplicates_check"
          )
            throw new DBAddFriendWrongFriendshipError();
        }
      }
    }

    console.error(err);
    throw new UnknownError();
  }
}

/**
 * Removes a friend from a user's friends list.
 * @param {number} userId - The id of the user to remove the friend from
 * @param {number} friendId - The id of the friend to remove
 * @throws {DBAddFriendWrongFriendshipError} - If the user and friend are not friends
 * @throws {UnknownError} - If an unexpected error occurs
 * @returns {Promise<void>} - Resolves when the friend has been removed
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

    if (!friendship) throw new DBAddFriendWrongFriendshipError();
  } catch (err) {
    if (err instanceof DBAddFriendWrongFriendshipError) throw err;

    console.error(err);
    throw new UnknownError();
  }
}

/**
 * Retrieves the list of friends for a given user.
 * @param {number} userId - The id of the user to retrieve friends for
 * @throws {UnknownError} - If an unexpected error occurs
 * @returns {Promise<FriendInfo[]>} - A promise that resolves with the list of friends, or rejects if an unexpected error occurs
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

    return friends;
  } catch (err) {
    console.error(err);
    throw new UnknownError();
  }
}
