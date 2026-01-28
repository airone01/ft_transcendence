import { integer, pgTable, serial, varchar } from "drizzle-orm/pg-core";

export const user = pgTable("user", {
  id: serial("id").primaryKey(),
  age: integer("age"),
  email: varchar("email").unique(),
});
