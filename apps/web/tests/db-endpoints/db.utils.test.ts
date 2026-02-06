import { describe, test } from "bun:test";
import { dbGetLeaderboard, dbGetUserGameHistory } from "$lib/db-services";

describe("Leaderboard", () => {
  test("getLeaderboard", async () => {
    try {
      const leaderboard = await dbGetLeaderboard();

      console.table(leaderboard);
    } catch (err) {
      console.error(err);
    }
  });

  test("getGameHistory", async () => {
    try {
      const history = await dbGetUserGameHistory(95);

      console.table(history);
    } catch (err) {
      console.error(err);
    }
  });
});
