import "dotenv/config";
import { drizzle } from "drizzle-orm/node-postgres";
import { Pool, neonConfig } from "@neondatabase/serverless";
import ws from "ws";
import { env } from "../env";

neonConfig.webSocketConstructor = ws;

const pool = new Pool({ connectionString: env?.DATABASE_URL as string });

export const db = drizzle({ client: pool });
