import { describe, test } from "bun:test";
import { dbGetLeaderboard } from "$lib/db-services";

describe("Leaderboard", () => {
  test("getLeaderboard", async () => {
    try {
      const leaderboard = await dbGetLeaderboard();

      console.table(leaderboard);
    } catch (err) {
      console.error(err);
    }
  });
});
