import { beforeAll, describe, expect, test } from "bun:test";
import { styleText } from "node:util";
import { db } from "@transc/db";
import { users } from "@transc/db/schema";
import { eq } from "drizzle-orm";
import {
  type CreateUserInput,
  dbCreateUser,
  dbDeleteUser,
  dbGetStats,
  dbUpdateUser,
  type UpdateUserInput,
} from "$lib/db-services";

describe("users.service.ts tests", () => {
  let userId: number;

  const newUser: CreateUserInput = {
    username: "Alice",
    email: "alice@test.com",
    password: "supersecret",
    avatar: "https://example.com/avatar.png",
  };

  beforeAll(async () => {
    await db.delete(users).where(eq(users.username, newUser.username));
  });

  test("createUser", async () => {
    try {
      userId = await dbCreateUser(newUser);

      console.log(
        styleText("bold", "Created user with id: ") +
          styleText(["bold", "yellow"], `${userId}`),
      );
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

      console.table(stats);
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
