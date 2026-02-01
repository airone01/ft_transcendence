import { db } from "./index";
import { users, authSessions } from "./schema";

async function main() {
  try {
    await db.delete(authSessions);
    await db.delete(users);

    console.log("✅ Database cleared");
    process.exit(0);
  } catch (e) {
    console.error("❌ Error clearing database:", e);
    process.exit(1);
  }
}

main();
