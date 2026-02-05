import { beforeAll, describe, expect, test } from "bun:test";
import { db } from "@transc/db";
import { users } from "@transc/db/schema";
import { eq } from "drizzle-orm";
import {
  type CreateUserInput,
  type UpdateUserInput,
  dbCreateUser,
  dbUpdateUser,
  dbDeleteUser,
  dbGetStats,
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
beforeAll(async () => {
  userId = await getUserId("Valentin");
});

describe("users.service.ts tests", () => {
  const newUser: CreateUserInput = {
    username: "Alice",
    email: "alice@test.com",
    password: "supersecret",
    avatar: "https://example.com/avatar.png",
  };

  beforeAll(async () => {
    await db.delete(users).where(eq(users.email, newUser.email));
  });

  test("createUser", async () => {
    try {
      await dbCreateUser(newUser);
    } catch (err) {
      console.error(err);
    }

    const user = await db
      .select()
      .from(users)
      .where(eq(users.email, newUser.email))
      .limit(1);

    expect(user.length).toBe(1);
  });

  const updatedUser: UpdateUserInput = {
    email: "hellooo@test.com",
    avatar: "",
  };

  test("updateUser", async () => {
    try {
      await dbUpdateUser(userId, updatedUser);
    } catch (err) {
      console.error(err);
    }
  });

  test("getStats", async () => {
    try {
      const stats = await dbGetStats(userId);
      // console.table(stats);

      expect(stats).toBeDefined();
    } catch (err) {
      console.error(err);
    }
  });

  test("deleteUser", async () => {
    try {
      await dbDeleteUser(userId);
    } catch (err) {
      console.error(err);
    }
  });
});
