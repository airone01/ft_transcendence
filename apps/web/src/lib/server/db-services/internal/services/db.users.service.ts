import { db } from "@transc/db";
import {
  achievements,
  chatChannelMembers,
  chatChannels,
  eloHistory,
  users,
  usersStats,
} from "@transc/db/schema";
import { desc, DrizzleQueryError, eq, not, sql } from "drizzle-orm";
import type { DatabaseError } from "pg";
import {
  type Achievements,
  type ChatChannelType,
  type CreateUserInput,
  DBCreateUserEmailAlreadyExistsError,
  DBCreateUserUsernameAlreadyExistsError,
  DBUserNotFoundError,
  UnknownError,
  type UpdateUserInput,
  type User,
  type UserStats,
} from "$lib/server/db-services";

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

      await tx.insert(usersStats).values({
        userId: newUser.id,
      });

      await tx.insert(eloHistory).values({
        userId: newUser.id,
      });

      await tx.insert(achievements).values({
        userId: newUser.id,
      });

      const [globalChannelId] = await tx
        .select({ id: chatChannels.id })
        .from(chatChannels)
        .where(eq(chatChannels.type, "global" as ChatChannelType))
        .limit(1);

      await tx.insert(chatChannelMembers).values({
        userId: newUser.id,
        channelId: globalChannelId.id,
      });

      return newUser.id;
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
 * Retrieves five random users
 * @param {number} userId - The id of the user requesting
 * @throws {UnknownError} - If an unexpected error occurs
 * @returns {Promise<User[]>} - A promise that resolves with the users array
 */
export async function dbGetRandomUsers(userId: number): Promise<User[]> {
  try {
    return await db
      .select()
      .from(users)
      .where(not(eq(users.id, userId)))
      .orderBy(sql`RANDOM()`)
      .limit(5);
  } catch (err) {
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
    const [user] = await db.select().from(users).where(eq(users.id, userId));

    if (!user) throw new DBUserNotFoundError();

    return user;
  } catch (err) {
    if (err instanceof DBUserNotFoundError) throw err;

    console.error(err);
    throw new UnknownError();
  }
}

/**
 * Retrieves a user from the database by their email.
 * @param {string} email - The email of the user to retrieve
 * @throws {UnknownError} - If an unexpected error occurs
 * @returns {Promise<User | undefined>} - A promise that resolves with the user if found, undefined otherwise
 */
export async function dbGetUserByEmail(
  email: string,
): Promise<User | undefined> {
  try {
    const [user] = await db.select().from(users).where(eq(users.email, email));

    return user ?? undefined;
  } catch (err) {
    console.error(err);
    throw new UnknownError();
  }
}

/**
 * Retrieves a user from the database by their username.
 * @param {string} username - The username of the user to retrieve
 * @throws {UnknownError} - If an unexpected error occurs
 * @returns {Promise<User | undefined>} - A promise that resolves with the user if found, undefined otherwise
 */
export async function dbGetUserByUsername(
  username: string,
): Promise<User | undefined> {
  try {
    const [user] = await db
      .select()
      .from(users)
      .where(eq(users.username, username));

    return user ?? undefined;
  } catch (err) {
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

    await db
      .update(achievements)
      .set({ update_profile: true })
      .where(eq(achievements.userId, userId));
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

    return user;
  } catch (err) {
    if (err instanceof DBUserNotFoundError) throw err;

    console.error(err);
    throw new UnknownError();
  }
}

/**
 * Retrieves the elo history of a user.
 * The elo history is a list of elo entries with their corresponding createdAt date.
 * The list is sorted in descending order by createdAt date.
 * @param {number} userId - The id of the user to retrieve elo history for
 * @throws {UnknownError} - If an unexpected error occurs
 * @returns {Promise<{ elo: number; createdAt: Date }[]>} - A promise that resolves with the elo history, or rejects if an unexpected error occurs
 */
export async function dbGetEloHistory(userId: number): Promise<
  {
    elo: number;
    createdAt: Date;
  }[]
> {
  try {
    return await db
      .select({
        elo: eloHistory.elo,
        createdAt: eloHistory.createdAt,
      })
      .from(eloHistory)
      .where(eq(eloHistory.userId, userId))
      .orderBy(desc(eloHistory.createdAt));
  } catch (err) {
    console.error(err);
    throw new UnknownError();
  }
}


/**
 * Retrieves the achievements of a user.
 * @param {number} userId - The id of the user to retrieve achievements for
 * @throws {UnknownError} - If an unexpected error occurs
 * @returns {Promise<Achievements>} - A promise that resolves with the achievements of the user, or rejects if an unexpected error occurs
 */
export async function dbGetAchievements(userId: number): Promise<Achievements> {
  try {
    const [result] = await db
      .select()
      .from(achievements)
      .where(eq(achievements.userId, userId));

    return result;
  } catch (err) {
    console.error(err);
    throw new UnknownError();
  }
}
