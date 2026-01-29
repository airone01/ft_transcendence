import "dotenv/config";
import { drizzle } from "drizzle-orm/node-postgres";
import { Pool } from "pg";
import { connectionString } from "../env";
import { eq } from "drizzle-orm";
import { users, authSessions } from "./schema";
// import * as schema from "./schema";

const pool = new Pool({ connectionString: connectionString as string });
export const db = drizzle({ client: pool });

async function main() {
  //   const user: typeof users.$inferInsert = {
  //     username: "titi",
  //     email: "titi@gmail.com",
  //     password: "titi",
  //   };
  //     await db.insert(users).values(user);
  //     console.log("New user created!");
  // const authSession: typeof authSessions.$inferInsert = {
  //   userId: 9,
  //   expiresAt: new Date("2027-01-01T10:00:00Z"),
  // };
  // await db.insert(authSessions).values(authSession);
  // console.log("New auth_session created!");
  //   const getUsers = await db.select().from(users);
  //   console.log("Getting: ", getUsers);
  //   await db
  //     .update(users)
  //     .set({
  //       username: "Test",
  //       email: "Test@gmail.com",
  //     })
  //     .where(eq(users.email, user.email));
  //   console.log("User info updated!");
  //   await db.delete(users).where(eq(users.email, user.email));
  //   console.log("User deleted!");
}

main();
