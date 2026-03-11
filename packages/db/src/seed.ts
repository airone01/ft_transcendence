import { db } from "./index";
import { chatChannels } from "./schema";

async function seed() {
  await db
    .insert(chatChannels)
    .values({ type: "global" })
    .onConflictDoNothing();

  console.log("Seeded global channel");
  process.exit(0);
}

seed();
