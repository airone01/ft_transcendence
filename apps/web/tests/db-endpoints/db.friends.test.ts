import { beforeAll, describe, test } from "bun:test";
import { db } from "@transc/db";
import { users } from "@transc/db/schema";
import { eq } from "drizzle-orm";
import {
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

let userId: number;
let friendId: number;
beforeAll(async () => {
  userId = await getUserId("Erwan");
  friendId = await getUserId("Simon");
});

describe("friends.service.ts tests", () => {
  test("addFriend", async () => {
    try {
      await dbAddFriend(userId, friendId);
    } catch (err) {
      console.error(err);
    }
  });

  test("removeFriend", async () => {
    try {
      await dbRemoveFriend(userId, friendId);
    } catch (err) {
      console.error(err);
    }
  });

  test("getFriendsInfo", async () => {
    try {
      const friends = await dbGetFriendsInfo(userId);
      console.table(friends);
    } catch (err) {
      console.error(err);
    }
  });
});
