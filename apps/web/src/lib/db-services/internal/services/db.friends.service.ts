import { and, eq, ne, or } from "drizzle-orm";
import { db } from "@transc/db";
import { friendships, users, usersStats } from "@transc/db/schema";

export async function dbAddFriend(userId: number, friendId: number) {
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

export async function dbRemoveFriend(userId: number, friendId: number) {
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

export async function dbGetFriendsInfo(userId: number) {
  try {
    const friends = await db
      .select({
        userId: users.id,
        username: users.username,
        avatar: users.avatar,
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
    throw err;
  }
}
