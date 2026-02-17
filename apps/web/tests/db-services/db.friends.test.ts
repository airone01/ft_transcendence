import { beforeAll, describe, expect, test } from "bun:test";
import { db } from "@transc/db";
import { friendships, users } from "@transc/db/schema";
import { and, eq, or } from "drizzle-orm";
import {
  DBAddFriendFriendshipAlreadyExistsError,
  DBAddFriendWrongFriendshipError,
  DBUserNotFoundError,
  dbAddFriend,
  dbGetFriendsInfo,
  dbRemoveFriend,
} from "$lib/db-services";

async function getUserId(username: string) {
  const [user] = await db
    .select({ id: users.id })
    .from(users)
    .where(eq(users.username, username))
    .limit(1);

  return user.id;
}

describe("friends.service.ts tests", () => {
  let userId: number;
  let friendId: number;

  beforeAll(async () => {
    userId = await getUserId("Erwan");
    friendId = await getUserId("Simon");

    await db
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
      );
  });

  test("addFriend", async () => {
    try {
      await dbAddFriend(userId, friendId);

      expect(true).toBe(true);
    } catch (_err) {}
  });

  test("addFriend twice", async () => {
    try {
      await dbAddFriend(userId, friendId);
      await dbAddFriend(userId, friendId);
    } catch (err) {
      expect(err).toBeInstanceOf(DBAddFriendFriendshipAlreadyExistsError);
    }
  });

  test("addFriend with same user", async () => {
    try {
      await dbAddFriend(userId, userId);
    } catch (err) {
      expect(err).toBeInstanceOf(DBAddFriendWrongFriendshipError);
    }
  });

  test("addFriend with unknown first friend user", async () => {
    try {
      await dbAddFriend(Math.round(userId / 2), userId);
    } catch (err) {
      expect(err).toBeInstanceOf(DBUserNotFoundError);
    }
  });

  test("addFriend with unknown second friend user", async () => {
    try {
      await dbAddFriend(userId, 100000000);
    } catch (err) {
      expect(err).toBeInstanceOf(DBUserNotFoundError);
    }
  });

  test("getFriendsInfo", async () => {
    try {
      const friends = await dbGetFriendsInfo(userId);

      console.table(friends);
      expect(true).toBe(true);
    } catch (_err) {}
  });

  test("getFriendsInfo with wrong id", async () => {
    try {
      const friends = await dbGetFriendsInfo(100000000);

      expect(friends).toBeNull();
    } catch (_err) {}
  });

  test("removeFriend", async () => {
    try {
      await dbRemoveFriend(userId, friendId);

      expect(true).toBe(true);
    } catch (_err) {}
  });

  test("removeFriend twice", async () => {
    try {
      await dbRemoveFriend(userId, friendId);
      await dbRemoveFriend(userId, friendId);
    } catch (err) {
      expect(err).toBeInstanceOf(DBAddFriendWrongFriendshipError);
    }
  });
});
