import { db } from "@transc/db";
import { users, usersStats } from "@transc/db/schema";
import { eq } from "drizzle-orm";
import type {
  CreateUserInput,
  UpdateUserInput,
  User,
  UserStats,
} from "$lib/db-services";

/**
 * Creates a new user in the database.
 * @param {CreateUserInput} userInput - The input for creating a new user, including the username, email, password and avatar
 * @throws {Error} - If the user is not created, or if an unexpected error occurs
 * @returns {Promise<number>} - A promise that resolves with the id of the created user when the user is created, or rejects if the user creation fails
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

      return stats.id;
    });

    return userId;
  } catch (err) {
    console.error(err);
    throw err;
  }
}

/**
 * Retrieves a user by its id.
 * @param {number} userId - The id of the user to retrieve
 * @throws {Error} - If the user is not found, or if an unexpected error occurs
 * @returns {Promise<User>} - A promise that resolves with the user info when the user is found, or rejects if the user retrieval fails
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

    return user as User;
  } catch (err) {
    console.error(err);
    throw err;
  }
}

/**
 * Updates a user in the database with a new username, email, password and avatar.
 * @param {number} userId - The id of the user to update
 * @param {UpdateUserInput} userInput - The input for updating a user, including the new username, email, password and avatar
 * @throws {Error} - If the user is not found, or if an unexpected error occurs
 * @returns {Promise<void>} - A promise that resolves when the user is updated, or rejects if the user update fails.
 */
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

    if (!user) throw new Error("DB: User not updated");
  } catch (err) {
    console.error(err);
    throw err;
  }
}

/**
 * Deletes a user from the database.
 * @param {number} userId - The id of the user to delete
 * @throws {Error} - If the user is not found, or if an unexpected error occurs
 * @returns {Promise<void>} - A promise that resolves when the user is deleted, or rejects if the user deletion fails.
 */
export async function dbDeleteUser(userId: number): Promise<void> {
  try {
    const [user] = await db
      .delete(users)
      .where(eq(users.id, userId))
      .returning();

    if (!user) throw new Error("DB: User not deleted");
  } catch (err) {
    console.error(err);
    throw err;
  }
}

/**
 * Retrieves the user stats for a given user.
 * @param {number} userId - The id of the user to retrieve stats for
 * @throws {Error} - If the user is not found, or if an unexpected error occurs
 * @returns {Promise<UserStats>} - Resolves with the user stats, including the number of games played, wins, losses, draws, and the current elo
 */
export async function dbGetStats(userId: number): Promise<UserStats> {
  try {
    const [user] = await db
      .select()
      .from(usersStats)
      .where(eq(usersStats.userId, userId));

    if (!user) throw new Error("DB: User not found");

    return user as UserStats;
  } catch (err) {
    console.error(err);
    throw err;
  }
}
