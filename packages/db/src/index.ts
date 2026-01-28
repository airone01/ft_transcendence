import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";
import { connectionString } from "../env";
import * as schema from "./schema";

const client = postgres(connectionString as string);
export const db = drizzle(client, { schema });
