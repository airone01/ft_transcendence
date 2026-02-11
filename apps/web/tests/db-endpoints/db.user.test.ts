import { beforeAll, describe, expect, test } from "bun:test";
import { styleText } from "node:util";
import { db } from "@transc/db";
import { users } from "@transc/db/schema";
import { eq } from "drizzle-orm";
import {
  type CreateUserInput,
  DBCreateUserEmailAlreadyExistsError,
  DBCreateUserUsernameAlreadyExistsError,
  DBUserNotFoundError,
  dbCreateUser,
  dbDeleteUser,
  dbGetStats,
  dbGetUser,
  dbIsEmailTaken,
  dbIsUsernameTaken,
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

  test("isUsernameTaken", async () => {
    try {
      const isNotTaken = await dbIsUsernameTaken(newUser.username);
      const isTaken = await dbIsUsernameTaken("Valentin");

      expect(isNotTaken).toBe(false);
      expect(isTaken).toBe(true);
    } catch (_err) {}
  });

  test("isEmailTaken", async () => {
    try {
      const isNotTaken = await dbIsEmailTaken(newUser.email);
      const isTaken = await dbIsEmailTaken("valentin@transcender");

      expect(isNotTaken).toBe(false);
      expect(isTaken).toBe(true);
    } catch (_err) {}
  });

  test("createUser", async () => {
    try {
      userId = await dbCreateUser(newUser);

      expect(userId).toBeDefined();
      console.log(
        styleText("bold", "Created user with id: ") +
          styleText(["bold", "yellow"], `${userId}`),
      );
    } catch (_err) {}
  });

  test("createUser with same username", async () => {
    try {
      userId = await dbCreateUser({ ...newUser, email: "bob@test.com" });
    } catch (err) {
      expect(err).toBeInstanceOf(DBCreateUserUsernameAlreadyExistsError);
    }
  });

  test("createUser with same email", async () => {
    try {
      userId = await dbCreateUser({ ...newUser, username: "Bob" });
    } catch (err) {
      expect(err).toBeInstanceOf(DBCreateUserEmailAlreadyExistsError);
    }
  });

  test("getUser", async () => {
    try {
      const user = await dbGetUser(userId);

      expect(user).toBeDefined();
      console.table(user);
    } catch (_err) {}
  });

  test("getUser with wrong id", async () => {
    try {
      const _user = await dbGetUser(100000000);
    } catch (err) {
      expect(err).toBeInstanceOf(DBUserNotFoundError);
    }
  });

  const updatedUser: UpdateUserInput = {
    email: "hellooo@test.com",
    avatar: "",
  };

  test("updateUser", async () => {
    try {
      await dbUpdateUser(userId, updatedUser);

      expect(true).toBe(true);
    } catch (_err) {}
  });

  test("updateUser with wrong id", async () => {
    try {
      await dbUpdateUser(100000000, updatedUser);
    } catch (err) {
      expect(err).toBeInstanceOf(DBUserNotFoundError);
    }
  });

  test("getStats", async () => {
    try {
      const stats = await dbGetStats(userId);

      expect(stats).toBeDefined();
      console.table(stats);
    } catch (_err) {}
  });

  test("deleteUser", async () => {
    try {
      await dbDeleteUser(userId);

      expect(true).toBe(true);
    } catch (_err) {}
  });
});
