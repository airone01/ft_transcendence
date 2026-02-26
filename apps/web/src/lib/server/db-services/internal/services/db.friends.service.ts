import { db } from "@transc/db";
import {
  chatChannelMembers,
  chatChannels,
  friendships,
  friendshipsInvitations,
  users,
  usersStats,
} from "@transc/db/schema";
import { and, DrizzleQueryError, desc, eq, ne, or } from "drizzle-orm";
import type { DatabaseError } from "pg";
import {
  DBAddFriendFriendshipAlreadyExistsError,
  DBAddFriendWrongFriendshipError,
  DBCreateChatChannelError,
  DBUserNotFoundError,
  type FriendInfo,
  UnknownError,
} from "$lib/server/db-services";

/**
 * Requests a friendship from a user to another user.
 * If the friendship already exists, an error is thrown.
 * If not, a friendship invitation is created.
 * @param {number} userId - The id of the user who sent the request
 * @param {number} friendId - The id of the user who received the request
 * @throws {DBAddFriendFriendshipAlreadyExistsError} - If the friendship already exists
 * @throws {UnknownError} - If an unexpected error occurs
 * @returns {Promise<void>} - A promise that resolves when the friendship invitation has been created
 */
export async function dbRequestFriendship(
  userId: number,
  friendId: number,
): Promise<void> {
  try {
    const [friendship] = await db
      .select()
      .from(friendships)
      .where(
        and(
          eq(friendships.firstFriendId, Math.min(userId, friendId)),
          eq(friendships.secondFriendId, Math.max(userId, friendId)),
        ),
      );

    const [invitation] = await db
      .select()
      .from(friendshipsInvitations)
      .where(
        and(
          eq(friendshipsInvitations.userId, Math.min(userId, friendId)),
          eq(friendshipsInvitations.friendId, Math.max(userId, friendId)),
        ),
      );

    if (friendship || invitation)
      throw new DBAddFriendFriendshipAlreadyExistsError();

    await db.insert(friendshipsInvitations).values({
      userId: userId,
      friendId: friendId,
    });
  } catch (err) {
    if (err instanceof DBAddFriendFriendshipAlreadyExistsError) throw err;

    console.error(err);
    throw new UnknownError();
  }
}

/**
 * Retrieves all the friend requests of a user.
 * @param {number} userId - The id of the user to retrieve friend requests for
 * @returns {Promise<{userId: number, username: string, avatar: string | null, type: "received" | "sent"}[]>} - A promise that resolves with an array of friend requests, with each request containing the id, username, avatar and type of the request.
 * @throws {UnknownError} - If an unexpected error occurs
 */
export async function dbGetInvitations(userId: number): Promise<
  {
    userId: number;
    username: string;
    avatar: string | null;
    type: "received" | "sent";
  }[]
> {
  try {
    const invitationsReceived = await db
      .select({
        userId: users.id,
        username: users.username,
        avatar: users.avatar,
        createdAt: friendshipsInvitations.createdAt,
      })
      .from(friendshipsInvitations)
      .innerJoin(users, eq(users.id, friendshipsInvitations.userId))
      .where(eq(friendshipsInvitations.friendId, userId))
      .orderBy(desc(friendshipsInvitations.createdAt));

    const invitationsSent = await db
      .select({
        userId: users.id,
        username: users.username,
        avatar: users.avatar,
        createdAt: friendshipsInvitations.createdAt,
      })
      .from(friendshipsInvitations)
      .innerJoin(users, eq(users.id, friendshipsInvitations.friendId))
      .where(eq(friendshipsInvitations.userId, userId))
      .orderBy(desc(friendshipsInvitations.createdAt));

    // Concatenate the received and sent invitations and sort them by date
    const result = [
      ...invitationsReceived.map((i) => ({
        ...i,
        type: "received" as "received" | "sent",
      })),
      ...invitationsSent.map((i) => ({
        ...i,
        type: "sent" as "received" | "sent",
      })),
    ].sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());

    return result;
  } catch (err) {
    console.error(err);
    throw new UnknownError();
  }
}

/**
 * Rejects a friendship request from a user to another user.
 * @param {number} userId - The id of the user who sent the request
 * @param {number} friendId - The id of the user who received the request
 * @throws {UnknownError} - If an unexpected error occurs
 * @returns {Promise<void>} - A promise that resolves when the friend request has been refused
 */
export async function dbRejectFriendship(
  userId: number,
  friendId: number,
): Promise<void> {
  try {
    await db
      .delete(friendshipsInvitations)
      .where(
        and(
          eq(friendshipsInvitations.userId, userId),
          eq(friendshipsInvitations.friendId, friendId),
        ),
      );
  } catch (err) {
    console.error(err);
    throw new UnknownError();
  }
}

/**
 * Adds a friend to a user's friends list.
 * @param {number} userId - The id of the user to add the friend to
 * @param {number} friendId - The id of the friend to add
 * @throws {DBAddFriendFriendshipAlreadyExistsError} - If the user and friend are already friends
 * @throws {DBAddFriendWrongFriendshipError} - If the user and friend are not friends
 * @throws {DBUserNotFoundError} - If either the user or friend does not exist
 * @throws {UnknownError} - If an unexpected error occurs
 * @returns {Promise<void>} - A promise that resolves when the friend has been added
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

    const [channel] = await db
      .insert(chatChannels)
      .values({
        type: "private",
      })
      .returning();

    if (!channel) throw new DBCreateChatChannelError();

    const channelMembers = await db
      .insert(chatChannelMembers)
      .values([
        {
          channelId: channel.id,
          userId: userId,
        },
        {
          channelId: channel.id,
          userId: friendId,
        },
      ])
      .returning();

    if (channelMembers.length !== 2) throw new DBCreateChatChannelError();
  } catch (err) {
    if (err instanceof DBUserNotFoundError) throw err;
    if (err instanceof DBCreateChatChannelError) throw err;

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
        bio: users.bio,
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
