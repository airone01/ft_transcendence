import { db } from "@transc/db";
import {
  chatChannelMembers,
  chatChannels,
  users,
  usersStats,
} from "@transc/db/schema";
import { DrizzleQueryError, eq } from "drizzle-orm";
import type { DatabaseError } from "pg";
import {
  type ChatChannelType,
  type CreateUserInput,
  DBCreateUserEmailAlreadyExistsError,
  DBCreateUserUsernameAlreadyExistsError,
  DBUserNotFoundError,
  UnknownError,
  type UpdateUserInput,
  type User,
  type UserStats,
} from "$lib/db-services";

/**
 * Checks if a given username is taken in the database.
 * @param {string} username - The username to check
 * @returns {Promise<boolean>} - A promise that resolves with true if the username is taken, false otherwise
 */
export async function dbIsUsernameTaken(username: string): Promise<boolean> {
  try {
    const [user] = await db
      .select()
      .from(users)
      .where(eq(users.username, username));

    return !!user;
  } catch (err) {
    console.error(err);
    throw new UnknownError();
  }
}

/**
 * Checks if a given email is taken in the database.
 * @param {string} email - The email to check
 * @returns {Promise<boolean>} - A promise that resolves with true if the email is taken, false otherwise
 */
export async function dbIsEmailTaken(email: string): Promise<boolean> {
  try {
    const [user] = await db.select().from(users).where(eq(users.email, email));

    return !!user;
  } catch (err) {
    console.error(err);
    throw new UnknownError();
  }
}

/**
 * Creates a new user in the database.
 * @param {CreateUserInput} userInput - The input to create a new user, including the username, email, password, and avatar.
 * @throws {DBCreateUserUsernameAlreadyExistsError} - If the username is already taken
 * @throws {DBCreateUserEmailAlreadyExistsError} - If the email is already in use
 * @throws {UnknownError} - If an unexpected error occurs
 * @returns {Promise<number>} - A promise that resolves with the ID of the created user
 */
export async function dbCreateUser(
  userInput: CreateUserInput,
): Promise<number> {
  try {
    const userId = await db.transaction(async (tx) => {
      const [newUser] = await tx
        .insert(users)
        .values({
          username: userInput.username,
          email: userInput.email,
          password: userInput.password,
          avatar: userInput.avatar,
        })
        .returning();

      const [stats] = await tx
        .insert(usersStats)
        .values({
          userId: newUser.id,
        })
        .returning({ id: usersStats.userId });

      const [globalChannelId] = await tx
        .select({ id: chatChannels.id })
        .from(chatChannels)
        .where(eq(chatChannels.type, "global" as ChatChannelType))
        .limit(1);

      const [_chat] = await tx
        .insert(chatChannelMembers)
        .values({
          userId: stats.id,
          channelId: globalChannelId.id,
        })
        .returning();

      return stats.id;
    });

    return userId;
  } catch (err) {
    if (err instanceof DrizzleQueryError) {
      const cause = err.cause;

      if (cause && typeof cause === "object" && "code" in cause) {
        const pgError = cause as DatabaseError;

        if (pgError.code === "23505") {
          if (
            pgError.constraint &&
            pgError.constraint === "users_username_unique"
          )
            throw new DBCreateUserUsernameAlreadyExistsError();
          else if (
            pgError.constraint &&
            pgError.constraint === "users_email_unique"
          )
            throw new DBCreateUserEmailAlreadyExistsError();
        }
      }
    }

    console.error(err);
    throw new UnknownError();
  }
}

/**
 * Retrieves a user from the database by their ID.
 * @param {number} userId - The id of the user to retrieve
 * @throws {DBUserNotFoundError} - If the user is not found
 * @throws {UnknownError} - If an unexpected error occurs
 * @returns {Promise<User>} - A promise that resolves with the user if found, or rejects if the user is not found or an unexpected error occurs
 */
export async function dbGetUser(userId: number): Promise<User> {
  try {
    const [user] = await db
      .select({
        id: users.id,
        username: users.username,
        email: users.email,
        avatar: users.avatar,
        status: users.status,
        createdAt: users.createdAt,
      })
      .from(users)
      .where(eq(users.id, userId));

    if (!user) throw new DBUserNotFoundError();

    return user as User;
  } catch (err) {
    if (err instanceof DBUserNotFoundError) throw err;

    console.error(err);
    throw new UnknownError();
  }
}

export async function dbUpdateUser(
  userId: number,
  userInput: UpdateUserInput,
): Promise<void> {
  try {
    const [user] = await db
      .update(users)
      .set({
        username: userInput.username,
        email: userInput.email,
        password: userInput.password,
        avatar: userInput.avatar,
      })
      .where(eq(users.id, userId))
      .returning();

    if (!user) throw new DBUserNotFoundError();
  } catch (err) {
    if (err instanceof DBUserNotFoundError) throw err;

    console.error(err);
    throw new UnknownError();
  }
}

/**
 * Deletes a user from the database.
 * @param {number} userId - The id of the user to delete
 * @throws {DBUserNotFoundError} - If the user is not found
 * @throws {UnknownError} - If an unexpected error occurs
 * @returns {Promise<void>} - A promise that resolves when the user is deleted, or rejects if the user is not found or an unexpected error occurs
 */
export async function dbDeleteUser(userId: number): Promise<void> {
  try {
    const [user] = await db
      .delete(users)
      .where(eq(users.id, userId))
      .returning();

    if (!user) throw new DBUserNotFoundError();
  } catch (err) {
    if (err instanceof DBUserNotFoundError) throw err;

    console.error(err);
    throw new UnknownError();
  }
}

/**
 * Retrieves the user stats for a given user.
 * @param {number} userId - The id of the user to retrieve stats for
 * @throws {DBUserNotFoundError} - If the user is not found
 * @throws {UnknownError} - If an unexpected error occurs
 * @returns {Promise<UserStats>} - A promise that resolves with the user stats, or rejects if the user is not found or an unexpected error occurs
 */
export async function dbGetStats(userId: number): Promise<UserStats> {
  try {
    const [user] = await db
      .select()
      .from(usersStats)
      .where(eq(usersStats.userId, userId));

    if (!user) throw new DBUserNotFoundError();

    return user as UserStats;
  } catch (err) {
    if (err instanceof DBUserNotFoundError) throw err;

    console.error(err);
    throw new UnknownError();
  }
}
