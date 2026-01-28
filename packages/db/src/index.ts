import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";
import { connectionString } from "../env.ts";
import * as schema from "./schema";

const client = postgres(connectionString);
export const db = drizzle(client, { schema });
