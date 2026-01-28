import { defineConfig } from "drizzle-kit";
import { connectionString } from "./env";

export default defineConfig({
  schema: "./src/schema.ts",
  dialect: "postgresql",
  dbCredentials: { url: connectionString as string },
  verbose: true,
  strict: true,
});
