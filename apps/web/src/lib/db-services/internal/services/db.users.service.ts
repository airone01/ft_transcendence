import { db } from "@transc/db";
import { users, usersStats } from "@transc/db/schema";
import { eq } from "drizzle-orm";
import {
  type CreateUserInput,
  type UpdateUserInput,
  type UserStats,
} from "$lib/db-services";

export async function dbCreateUser(userInput: CreateUserInput) {
  try {
    const [user] = await db
      .insert(users)
      .values({
        username: userInput.username,
        email: userInput.email,
        password: userInput.password,
        avatar: userInput.avatar,
      })
      .returning();

    if (!user) throw new Error("DB: User not created");
    return user;
  } catch (err) {
    console.error(err);
    throw err;
  }
}

export async function dbUpdateUser(userId: number, userInput: UpdateUserInput) {
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

export async function dbDeleteUser(userId: number) {
  try {
    const [user] = await db
      .delete(users)
      .where(eq(users.id, userId))
      .returning();

    if (!user) throw new Error("DB: User not deleted");
  } catch (err) {
    throw err;
  }
}

export async function dbGetStats(userId: number): Promise<UserStats> {
  try {
    const [user] = await db
      .select({
        userId: users.id,
        gamesPlayed: usersStats.gamesPlayed,
        wins: usersStats.wins,
        losses: usersStats.losses,
        draws: usersStats.draws,
        currentElo: usersStats.currentElo,
        updatedAt: usersStats.updatedAt,
      })
      .from(usersStats)
      .innerJoin(users, eq(users.id, usersStats.userId))
      .where(eq(users.id, userId))
      .limit(1);

    if (!user) throw new Error("DB: User not found");
    return user as UserStats;
  } catch (err) {
    console.error(err);
    throw err;
  }
}
