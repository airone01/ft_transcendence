import "dotenv/config";
import { drizzle } from "drizzle-orm/node-postgres";
import { Pool } from "pg";
import { connectionString } from "../env";

const pool = new Pool({ connectionString: connectionString as string });

export const db = drizzle({ client: pool });
