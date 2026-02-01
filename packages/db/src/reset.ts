import { db } from "./index";
import { user, session } from "./schema";

async function main() {
  try {
    await db.delete(session);
    await db.delete(user);

    console.log("✅ Database cleared");
    process.exit(0);
  } catch (e) {
    console.error("❌ Error clearing database:", e);
    process.exit(1);
  }
}

main();
