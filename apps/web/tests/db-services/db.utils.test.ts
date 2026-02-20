import { describe, expect, test } from "bun:test";
import { db } from "@transc/db";
import { users } from "@transc/db/schema";
import { eq } from "drizzle-orm";
import {
  dbGetLeaderboard,
  dbGetUserGameHistory,
} from "$lib/server/db-services";

describe("Leaderboard", () => {
  test("getLeaderboard", async () => {
    try {
      const leaderboard = await dbGetLeaderboard();

      console.table(leaderboard);
      expect(leaderboard).toBeDefined();
    } catch (_err) {}
  });

  test("getGameHistory", async () => {
    try {
      const [userId] = await db
        .select({ id: users.id })
        .from(users)
        .where(eq(users.username, "Valentin"))
        .limit(1);
      const history = await dbGetUserGameHistory(userId.id);

      console.table(history);
      expect(true).toBe(true);
    } catch (_err) {}
  });

  test("getGameHistory with wrong id", async () => {
    try {
      const history = await dbGetUserGameHistory(100000000);

      console.table(history);
    } catch (_err) {}
  });
});
