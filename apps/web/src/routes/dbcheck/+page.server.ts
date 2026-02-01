import { db } from "@transc/db";
import { users } from "@transc/db/schema";

export async function load() {
  try {
    // The "Drizzle Way": Select from the schema object
    // We limit(1) because we don't care about the data, just the successful query
    const usersList = await db.select().from(users).limit(1);

    return {
      dbStatus: "Connected to DB & schema synced ✅",
      userCount: usersList.length,
      error: null,
    };
  } catch (e: unknown) {
    console.error("DB test failed:", e);

    // This helps distinguish "DB is down" vs "Table missing"
    let status = "Error ❌";
    const f = e as Error & { code: string };
    if (f.code === "ECONNREFUSED") status = "DB Down ❌";
    if (f.code === "42P01")
      status = "Table missing (did you run `bun run db:push`) ⚠️";

    console.log(status);
    return {
      dbStatus: status,
      userCount: 0,
      error: f.message,
    };
  }
}
