import { db } from "./index";
import {
  achievements,
  authSessions,
  eloHistory,
  friendships,
  games,
  gamesPlayers,
  gamesSpectators,
  oauthAccounts,
  users,
  usersStats,
} from "./schema";

async function main() {
  try {
    // here go all the tables to delete
    // just import a table schema and add it to this array to have it be reset when this script is called
    const tablesMap = [
      authSessions,
      users,
      games,
      usersStats,
      friendships,
      gamesPlayers,
      oauthAccounts,
      gamesSpectators,
      eloHistory,
      achievements,
    ];

    await Promise.all(
      tablesMap.map(async (el) => {
        await db.delete(el);
      }),
    );

    console.log("✅ Database cleared");
    process.exit(0);
  } catch (e) {
    console.error("❌ Error clearing database:", e);
    process.exit(1);
  }
}

main();
